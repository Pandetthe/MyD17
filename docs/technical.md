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
bash scripts/onprem.sh init
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

### Konfiguracja powiadomień push

Powiadomienia push wymagają projektu Firebase z włączoną usługą FCM.

#### Klucz prywatny Firebase (Strapi)

1. Otworzyć [Firebase Console](https://console.firebase.google.com) i stworzyć nowy projekt (dowolna nazwa, reszta opcji domyślna).
2. Z głównego widoku projektu przejść do **Settings → Service accounts**.
3. Kliknąć **Generate new private key** — pobierze się plik JSON.
4. Wkleić zawartość pliku do `.env` jako wartość `FIREBASE_SERVICE_ACCOUNT` **w postaci jednej linii, bez białych znaków** (można do tego użyć dowolnego minifikatora JSON):

```dotenv
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"-----BEGIN RSA PRIVATE KEY-----\n..."}
```

Jeśli zmienna jest pusta lub nieprawidłowa, Strapi uruchomi się normalnie, ale powiadomienia push będą wyłączone (odpowiedni komunikat pojawi się w logach).

#### Plik google-services.json (dotyczy buildu aplikacji mobilnej)

Plik `google-services.json` jest wymagany i musi trafić do katalogu `apps/mobile`.

1. Z głównego widoku projektu Firebase Console przejść do **Settings → General**.
2. Stworzyć nową aplikację Android (Android package name: io.github.stawex.myd17 (lub z wartością znajdującą się pod android/package w pliku app.json w folderze apps/mobile, jeżeli nie jest używana domyślna wartość), reszta domyślnie).
3. Pobrać `google-services.json` i umieścić go w folderze `apps/mobile`.

### Uruchomienie

```bash
bash scripts/onprem.sh up
```

Sprawdzenie statusu:

```bash
bash scripts/onprem.sh status
```

Panel administracyjny Strapi jest dostępny pod:

```text
http://ADRES_SERWERA:1337/admin
```

Startowe konta administracyjne są tworzone przy pierwszym starcie, jeżeli jeszcze nie istnieją:

- `admin@myd17.pl`
- `employee@myd17.pl`

Hasła znajdują się w `.env` pod zmiennymi `STRAPI_ADMIN_PASSWORD` i `STRAPI_EMPLOYEE_PASSWORD`.

## Opcjonalna konfiguracja

Poniższe zmienne można dopisać ręcznie do `.env` po wygenerowaniu pliku przez `init`.

### Podgląd treści w panelu admina

Strapi udostępnia przycisk **„Open Preview"** na stronach edycji postów, kart informacyjnych i strony kontaktowej. Kliknięcie otwiera wyrenderowany podgląd bloków treści w nowej karcie.

Aby włączyć podgląd, ustaw losowy sekret:

```dotenv
PREVIEW_SECRET=twój-losowy-sekret
```

Bez tej zmiennej podgląd działa z domyślną wartością `change-me-in-production`, co jest akceptowalne tylko lokalnie. Na środowisku produkcyjnym **wymagane** jest ustawienie własnej wartości.

### Podgląd z aplikacją webową

Domyślnie podgląd renderuje uproszczoną wersję HTML. Aby zamiast tego używać skompilowanej aplikacji mobilnej (React Native Web), ustaw adres, pod którym jest ona dostępna:

```dotenv
EXPO_WEB_URL=http://localhost:8081
```

Wartość powinna wskazywać na serwer deweloperski Expo (`npx expo start --web`) lub na zbudowaną i hostowaną wersję statyczną (`npx expo export --platform web`). Adres jest przekazywany do strony podglądu jako parametr, więc musi być dostępny zarówno dla przeglądarki otwierającej podgląd, jak i dla serwera Strapi.

Pamiętaj, żeby dodać adres aplikacji webowej do zmiennej `CORS_ALLOWED_ORIGINS` w `.env`, np.:

```dotenv
CORS_ALLOWED_ORIGINS=http://localhost:1337,http://localhost:8081
```

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
bash scripts/onprem.sh migrate
```

Skrypt przed aktualizacją tworzy zweryfikowany backup bazy w katalogu `backups/`.

- Sprawdzić środowisko:

```bash
bash scripts/onprem.sh status
bash scripts/onprem.sh verify
```

## Wycofanie zmian (rollback)

- W pliku `.env` przywrócić poprzedni tag obrazu, np.:

```dotenv
STRAPI_IMAGE=ghcr.io/stawex-team/myd17/strapi:1.2.0
```

- Odtworzyć bazę z backupu utworzonego przed aktualizacją:

```bash
bash scripts/onprem.sh restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

- Sprawdzić system:

```bash
bash scripts/onprem.sh verify
```

Uwaga: komenda `restore` zatrzymuje Strapi, uruchamia bazę, tworzy dodatkowy backup aktualnego stanu bazy, odtwarza wskazany dump i ponownie uruchamia Strapi.

## Backup i odtwarzanie

Ręczny backup bazy:

```bash
bash scripts/onprem.sh backup
```

Backup trafia do katalogu `backups/` jako plik `.dump`.

Odtworzenie backupu:

```bash
bash scripts/onprem.sh restore backups/myd17-YYYYMMDD-HHMMSS.dump
```

Backup bazy nie zastępuje backupu uploadów. Pliki uploadowane w Strapi są w wolumenie Docker `strapi_uploads` i powinny być zabezpieczane osobno.

## Podstawowa diagnostyka

### Status usług

```bash
bash scripts/onprem.sh status
docker compose --project-name myd17 --env-file .env -f compose.yaml --profile prod ps
```

Oczekiwane usługi:

- `database` - status `healthy`.
- `strapi` - status `running` albo `healthy`.

### Logi

Wszystkie usługi:

```bash
bash scripts/onprem.sh logs
```

Tylko Strapi:

```bash
bash scripts/onprem.sh logs strapi
```

Tylko baza:

```bash
bash scripts/onprem.sh logs database
```

### Healthcheck aplikacji

```bash
curl http://localhost:1337/_health
```

Jeżeli endpoint nie odpowiada:

- Sprawdzić `bash scripts/onprem.sh status`.
- Sprawdzić `bash scripts/onprem.sh logs strapi`.
- Sprawdzić, czy port `1337/tcp` nie jest blokowany przez firewall lub reverse proxy.
- Sprawdzić, czy `.env` ma komplet wymaganych zmiennych:

```bash
bash scripts/onprem.sh verify
```
