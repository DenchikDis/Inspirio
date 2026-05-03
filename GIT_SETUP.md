# Настройка Git (Cursor + Git Bash + GitHub)

Чтобы все коммиты шли от твоего аккаунта и Vercel/проверки проходили без проблем.

## Текущие настройки (должны быть такие)

- **Имя:** `DenchikDis`
- **Email:** `12345678+DenchikDis@users.noreply.github.com` (no-reply от GitHub)

Они заданы **глобально** — и Cursor, и Git Bash используют один и тот же Git с этими данными.

## Проверка в терминале

В **Cursor Terminal** или **Git Bash** выполни:

```bash
git --version
git config --global user.name    # → DenchikDis
git config --global user.email   # → 12345678+DenchikDis@users.noreply.github.com
```

Проверка последнего коммита:

```bash
git log -1
# Должно быть: Author: DenchikDis <12345678+DenchikDis@users.noreply.github.com>
```

## Cursor: использовать системный Git

1. Открой **Cursor** → **Settings** (Ctrl+,).
2. Поиск: **Git** или **Version Control**.
3. Включи **Use system Git** (или аналогичную опцию), чтобы Cursor не подставлял другого автора.

После этого коммиты из Cursor будут с тем же автором, что и в Git Bash.

## Если нужно заново задать автора

Один раз в любом терминале (Git Bash / Cursor / cmd):

```bash
git config --global user.name "DenchikDis"
git config --global user.email "12345678+DenchikDis@users.noreply.github.com"
```

## Исправление автора в последнем коммите

Если последний коммит создан с чужим автором:

```bash
git commit --amend --reset-author --no-edit
git push --force
```

**Несколько старых коммитов** (переписать автора у последних 5):

```bash
git rebase -i HEAD~5
# В редакторе для нужных коммитов замени pick на edit, сохрани
# Для каждого:
git commit --amend --author="DenchikDis <12345678+DenchikDis@users.noreply.github.com>" --no-edit
git rebase --continue
# В конце:
git push --force
```

## Итог

- Глобальный Git на ПК: **DenchikDis** / **12345678+DenchikDis@users.noreply.github.com**.
- Cursor с опцией **Use system Git** будет коммитить от того же автора.
- Новые коммиты из Cursor и Git Bash будут с правильным автором, Vercel и проверки на GitHub будут проходить.
