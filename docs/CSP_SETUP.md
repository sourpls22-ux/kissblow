# Content Security Policy (CSP) Setup

## Обзор

Content Security Policy (CSP) - это механизм безопасности, который помогает предотвратить XSS атаки, ограничивая источники, из которых могут загружаться ресурсы (скрипты, стили, изображения и т.д.).

## Текущая конфигурация

CSP заголовки настроены в `next.config.ts` и применяются ко всем маршрутам приложения.

### Разрешенные источники

#### Scripts (скрипты)
- `'self'` - скрипты с того же домена (Next.js)
- `'unsafe-inline'` - inline скрипты (необходимо для Next.js и темы)
- `https://atlos.io` - ATLOS payment gateway
- `https://*.atlos.io` - поддомены ATLOS

**Development mode:**
- `'unsafe-eval'` - дополнительно разрешен для Hot Module Replacement

#### Styles (стили)
- `'self'` - стили с того же домена
- `'unsafe-inline'` - inline стили (Next.js использует CSS-in-JS)

#### Images (изображения)
- `'self'` - изображения с того же домена
- `data:` - data URI изображения
- `https:` - внешние HTTPS изображения
- `blob:` - blob URLs

#### Connect (AJAX запросы)
- `'self'` - запросы к нашему API
- `https://atlos.io` - ATLOS API
- `https://*.atlos.io` - поддомены ATLOS

#### Fonts (шрифты)
- `'self'` - шрифты с того же домена
- `data:` - встроенные шрифты

**Примечание:** Next.js использует `next/font/google` который встраивает шрифты локально, поэтому fonts.googleapis.com не нужен.

## Дополнительные Security Headers

Помимо CSP, настроены дополнительные заголовки безопасности:

1. **X-Content-Type-Options: nosniff**
   - Предотвращает MIME type sniffing

2. **X-Frame-Options: DENY**
   - Предотвращает clickjacking атаки
   - Блокирует загрузку страницы в iframe

3. **X-XSS-Protection: 1; mode=block**
   - Включает XSS фильтр браузера (legacy, но полезно для старых браузеров)

4. **Referrer-Policy: strict-origin-when-cross-origin**
   - Контролирует, какая информация отправляется в Referer заголовке

5. **Permissions-Policy**
   - Блокирует доступ к камере, микрофону, геолокации
   - Блокирует FLoC (Federated Learning of Cohorts)

## Мониторинг нарушений CSP

### Настройка report-uri

Для мониторинга нарушений CSP можно настроить `CSP_REPORT_URI` в `.env`:

```env
CSP_REPORT_URI="https://your-csp-reporting-service.com/report"
```

### Что происходит при нарушении CSP

1. Браузер блокирует загрузку ресурса
2. Если настроен `report-uri`, браузер отправляет отчет о нарушении на указанный URL

### Формат отчета

Отчет о нарушении CSP имеет следующий формат:

```json
{
  "csp-report": {
    "document-uri": "https://example.com/page",
    "violated-directive": "script-src",
    "blocked-uri": "https://malicious-site.com/script.js",
    "original-policy": "..."
  }
}
```

### Сервисы для мониторинга CSP

- **report-uri.com** - бесплатный сервис для мониторинга
- **Sentry** - поддерживает CSP reporting
- **Custom endpoint** - можно создать свой endpoint для логирования

## Улучшение безопасности в будущем

### 1. Использование Nonce для inline скриптов

Вместо `'unsafe-inline'` можно использовать nonce:

```typescript
// Генерировать nonce для каждого запроса
const nonce = crypto.randomBytes(16).toString('base64');

// В CSP
`script-src 'self' 'nonce-${nonce}' https://atlos.io`

// В HTML
<script nonce={nonce}>...</script>
```

### 2. Использование Hash для inline стилей

Можно вычислять hash для inline стилей:

```typescript
const styleHash = crypto.createHash('sha256').update(cssContent).digest('base64');
`style-src 'self' 'sha256-${styleHash}'`
```

### 3. Upgrade Insecure Requests

В production можно включить автоматическое обновление HTTP на HTTPS:

```typescript
"upgrade-insecure-requests"
```

Это автоматически преобразует все HTTP запросы в HTTPS.

## Тестирование CSP

### Проверка заголовков

Используйте браузерные DevTools:
1. Откройте Network tab
2. Выберите любой запрос
3. Проверьте Response Headers
4. Найдите `Content-Security-Policy`

### Проверка нарушений

1. Откройте Console в DevTools
2. Нарушения CSP будут отображаться как предупреждения
3. Если настроен report-uri, проверьте логи на сервере

### Тестирование в production

После деплоя проверьте заголовки с помощью:
- https://securityheaders.com/
- https://observatory.mozilla.org/

## Troubleshooting

### Скрипты не загружаются

Если скрипты блокируются CSP:
1. Проверьте Console в браузере
2. Найдите, какой директивой блокируется скрипт
3. Добавьте необходимый источник в `next.config.ts`

### Стили не применяются

Если стили не применяются:
1. Проверьте, что `'unsafe-inline'` разрешен для `style-src`
2. Проверьте, что источники шрифтов разрешены

## Важные замечания

⚠️ **Не удаляйте `'unsafe-inline'` для стилей без настройки nonce/hash**, так как Next.js использует CSS-in-JS и требует inline стили.

⚠️ **ATLOS скрипт** должен быть разрешен в `script-src`, иначе платежи не будут работать.

✅ **Все изменения CSP** должны тестироваться в development перед production деплоем.



