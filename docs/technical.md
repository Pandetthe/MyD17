# Dokumentacja techniczna

Dokument opisuje najprostszy sposób uruchomienia i utrzymania środowiska produkcyjnego na jednym serwerze on-premise.

## Składniki systemu

Środowisko produkcyjne uruchamia dwa kontenery:

- `database` - PostgreSQL 17, dane w wolumenie Docker `pgdata`.
- `strapi` - backend Strapi, uploady w wolumenie Docker `strapi_uploads`.

Najważniejsze pliki:

- `compose.yaml` - definicja kontenerów.
- `scripts/onprem.sh` - skrypt do instalacji, aktualizacji, backupu, restore i diagnostyki.
- `.env` - produkcyjne sekrety i konfiguracja.

## Pierwsza instalacja

Wszystkie polecenia wykonujemy z katalogu głównego repozytorium.

### Przygotowanie serwera

- Zainstalować Docker Engine i Docker Compose plugin.
- Sprawdzić instalację:

```bash
docker --version
docker compose version
```

- Sklonować repozytorium na serwer.

### Wygenerowanie konfiguracji

```bash
pnpm onprem init
```

Skrypt utworzy plik `.env` z losowymi sekretami, hasłem bazy i hasłami startowymi do kont admina.

Po wygenerowaniu:

```bash
chmod 600 .env
```

### Dostęp do obrazu Strapi

Opcja zalecana: pobranie obrazu z GitHub Container Registry.

```bash
echo GITHUB_TOKEN | docker login ghcr.io -u GITHUB_USER --password-stdin
```

W pliku `.env` ustawić obraz, najlepiej na konkretny tag wersji:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

Można też użyć `latest`, ale do produkcji zalecany jest konkretny tag.

Alternatywnie: lokalne zbudowanie obrazu.

```bash
docker build -t strapi:local -f apps/strapi/Dockerfile .
```

Następnie w `.env`:

```dotenv
STRAPI_IMAGE=strapi:local
```

### Uruchomienie

```bash
pnpm onprem up
```

Sprawdzenie statusu:

```bash
pnpm onprem status
```

Panel administracyjny Strapi jest dostępny pod:

```text
http://ADRES_SERWERA:1337/admin
```

Startowe konta administracyjne są tworzone przy pierwszym starcie, jeżeli jeszcze nie istnieją:

- `admin@myd17.pl`
- `employee@myd17.pl`

Hasła znajdują się w `.env` pod zmiennymi `STRAPI_ADMIN_PASSWORD` i `STRAPI_EMPLOYEE_PASSWORD`.

## Aktualizacja systemu

Aktualizacja polega na zmianie obrazu Strapi i restarcie aplikacji. Strapi wykonuje zmiany schematu podczas startu.

- Sprawdzić aktualną wersję w `.env`:

```bash
grep STRAPI_IMAGE .env
```

- Ustawić nowy tag obrazu w `.env`, np.:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.3.0
```

- Wykonać aktualizację:

```bash
pnpm onprem migrate
```

Skrypt przed aktualizacją tworzy zweryfikowany backup bazy w katalogu `backups/`.

- Sprawdzić środowisko:

```bash
pnpm onprem status
pnpm onprem verify
```

## Wycofanie zmian (rollback)

- W pliku `.env` przywrócić poprzedni tag obrazu, np.:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

- Odtworzyć bazę z backupu utworzonego przed aktualizacją:

```bash
pnpm onprem restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

- Sprawdzić system:

```bash
pnpm onprem verify
```

Uwaga: komenda `restore` zatrzymuje Strapi, uruchamia bazę, tworzy dodatkowy backup aktualnego stanu bazy, odtwarza wskazany dump i ponownie uruchamia Strapi.

## Backup i odtwarzanie

Ręczny backup bazy:

```bash
pnpm onprem backup
```

Backup trafia do katalogu `backups/` jako plik `.dump`.

Odtworzenie backupu:

```bash
pnpm onprem restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

Backup bazy nie zastępuje backupu uploadów. Pliki uploadowane w Strapi są w wolumenie Docker `strapi_uploads` i powinny być zabezpieczane osobno.

## Podstawowa diagnostyka

### Status usług

```bash
pnpm onprem status
docker compose --project-name myd17 --env-file .env -f compose.yaml --profile prod ps
```

Oczekiwane usługi:

- `database` - status `healthy`.
- `strapi` - status `running` albo `healthy`.

### Logi

Wszystkie usługi:

```bash
pnpm onprem logs
```

Tylko Strapi:

```bash
pnpm onprem logs strapi
```

Tylko baza:

```bash
pnpm onprem logs database
```

### Healthcheck aplikacji

```bash
curl http://localhost:1337/_health
```

Jeżeli endpoint nie odpowiada:

- Sprawdzić `pnpm onprem status`.
- Sprawdzić `pnpm onprem logs strapi`.
- Sprawdzić, czy port `1337/tcp` nie jest blokowany przez firewall lub reverse proxy.
- Sprawdzić, czy `.env` ma komplet wymaganych zmiennych:

```bash
pnpm onprem verify
```
