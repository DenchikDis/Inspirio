# Инструкция по деплою на Vercel

## Git и деплой (кратко)

1. **Отправить код на GitHub** (в своём терминале, где вы авторизованы):
   ```powershell
   cd "c:\Users\kuzne\Desktop\Insoire project\Inspire"
   git add .
   git commit -m "Ваше сообщение"
   git push origin main
   ```
2. **Деплой на Vercel:**
   - Если проект уже подключён к репозиторию на Vercel — после `git push` деплой запустится автоматически.
   - Или вручную из папки проекта: `.\deploy.ps1` или `npm run deploy`.

---

## Первоначальная настройка (один раз)

1. Установите Vercel CLI (опционально, можно использовать через npx):
   ```bash
   npm install -g vercel
   ```

2. Войдите в Vercel:
   ```bash
   vercel login
   ```

3. Свяжите проект с существующим проектом на Vercel:
   ```bash
   vercel link
   ```
   Или создайте новый проект:
   ```bash
   vercel
   ```

## Автоматический деплой

### Способ 1: Через скрипт (рекомендуется)

**Windows (Batch):**
```bash
deploy.bat
```

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

### Способ 2: Через npm скрипт

```bash
npm run deploy
```

### Способ 3: Через Vercel CLI напрямую

```bash
vercel --prod
```

Или через npx (если Vercel CLI не установлен глобально):
```bash
npx vercel --prod
```

## Превью деплой (для тестирования)

```bash
npm run deploy:preview
# или
vercel
```

## Автоматический деплой через GitHub

Если ваш проект подключен к GitHub, Vercel автоматически деплоит при каждом push в основную ветку.

1. Убедитесь, что проект подключен к Vercel через веб-интерфейс
2. Настройте автоматический деплой в настройках проекта на Vercel
3. При каждом `git push` проект будет автоматически обновляться

## Переменные окружения

Если вы используете переменные окружения (например, для Supabase), добавьте их в настройках проекта на Vercel:
1. Зайдите на vercel.com
2. Откройте ваш проект
3. Settings → Environment Variables
4. Добавьте необходимые переменные

## Структура проекта

- Главная страница: `/Page/index.html`
- Конфигурация Vercel: `vercel.json`
- Все запросы к `/` перенаправляются на `/Page/index.html`
