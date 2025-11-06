import SEOHead from '../../components/SEOHead'

const faqs = [
  { q: 'Законно ли использовать KissBlow.me?', a: 'Мы работаем как каталог. Соблюдайте законы вашей страны.' },
  { q: 'Как проходят проверки профилей?', a: 'Мы вручную проверяем документы и медиа. Подозрительные профили удаляются.' },
  { q: 'Как связаться с исполнителем?', a: 'Используйте способы связи на странице профиля. Общение приватное.' },
  { q: 'Мои данные в безопасности?', a: 'Мы используем шифрование, строгий контроль доступа и не продаём персональные данные.' },
  { q: 'Можно ли пожаловаться на профиль?', a: 'Да. Используйте кнопку жалобы на профиле или свяжитесь с поддержкой.' }
]

const structuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(({ q, a }) => ({
    "@type": "Question",
    "name": q,
    "acceptedAnswer": { "@type": "Answer", "text": a }
  }))
}

export default function FAQPageRu() {
  return (
    <>
      <SEOHead 
        title="FAQ — Частые вопросы"
        description="Ответы на популярные вопросы: проверка профилей, безопасность, связь, жалобы."
        canonical="/ru/faq"
        alternate={{ "en": "https://kissblow.me/faq" }}
        structuredData={structuredData}
      />

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold theme-text mb-6">FAQ — Частые вопросы</h1>
        <div className="space-y-6">
          {faqs.map(({ q, a }, i) => (
            <div key={i} className="theme-surface rounded-lg border theme-border p-4">
              <h2 className="text-lg font-semibold theme-text mb-2">{q}</h2>
              <p className="theme-text-secondary">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}












