# Inspire

A fresh project scaffold with Figma integration.

## Локальный запуск (просмотр сайта)

### Рекомендуемый способ: Vercel CLI (с поддержкой rewrites)

Для полного тестирования, включая Vercel rewrites и production-like окружение:

1. **Установите Vercel CLI** (один раз):
   ```bash
   npm install -g vercel
   ```

2. **Запустите dev сервер:**
   ```bash
   npm run dev
   ```
   Сервер откроется на `http://localhost:3000` и будет поддерживать все Vercel переписи.

3. Теперь вы можете:
   - Переходить на `/Page/project?slug=console` без `.html`
   - Тестировать все routing правила как в production
   - Проверять environment переменные

### Альтернатива: быстрый локальный serve

Если вы хотите быстро посмотреть сайт без настройки Vercel CLI:

1. **Запустите сервер:** дважды кликните по `start.bat` в корне проекта (или в терминале: `npm run dev:serve`).
2. Откроется Chrome с главной страницей. Если страница «недоступна» (ERR_CONNECTION_REFUSED) — сервер не запущен: снова запустите `start.bat` из папки проекта (должен быть установлен [Node.js](https://nodejs.org)).
3. **Примечание:** При использовании `npm run dev:serve` используйте прямые пути к файлам:
   - ✅ `http://localhost:3000/Page/project.html?slug=console`
   - ❌ `http://localhost:3000/Page/project?slug=console` (не работает без rewrites)

## Figma MCP Server Setup

To connect your Figma file to this project, see [FIGMA_SETUP.md](./FIGMA_SETUP.md) for detailed instructions.

Quick start:
1. Get your Figma API token from Figma Settings → Personal access tokens
2. Configure the MCP server in Cursor Settings
3. Restart Cursor to activate the connection

## Running the Figma Server

You can test the server directly using:
```bash
npm run figma-server
```

Or directly with npx:
```bash
npx @modelcontextprotocol/server-figma
```

## Figma File Search Script

Для поиска элементов в Figma файле используйте скрипт `find-figma-frame.js`:

### Базовое использование

```bash
# Показать все фреймы верхнего уровня
node find-figma-frame.js

# Поиск элемента по имени (частичное совпадение)
node find-figma-frame.js Main

# Точное совпадение имени
node find-figma-frame.js Main --exact

# Учитывать регистр
node find-figma-frame.js main --case-sensitive

# Поиск только определенных типов элементов
node find-figma-frame.js Main --types FRAME,COMPONENT
```

### Примеры

```bash
# Найти фрейм "Main"
node find-figma-frame.js Main

# Найти все компоненты с "Button" в названии
node find-figma-frame.js Button --types COMPONENT

# Найти точное совпадение "Header"
node find-figma-frame.js Header --exact
```

### Опции

- `--exact` или `-e` - Точное совпадение имени
- `--case-sensitive` или `-c` - Учитывать регистр букв
- `--types` или `-t` - Фильтр по типам элементов (FRAME, COMPONENT, TEXT, GROUP, INSTANCE)

Скрипт выводит подробную информацию о найденных элементах: путь, размер, цвета, шрифты и другие свойства.