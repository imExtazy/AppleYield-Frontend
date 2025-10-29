import { Breadcrumbs } from '../components/Breadcrumbs';

export default function LandingPage() {
  return (
    <>
      <Breadcrumbs />
      <section className="ay-hero">
        <div className="ay-hero-head">
          <div className="ay-hero-spacer"></div>
          <h1 className="ay-hero-title">Расчет урожайности сада антоновки для указанных климатических условий в сезоне</h1>
          <div style={{ width: 70, height: 70 }}></div>
        </div>
        <div className="ay-search-center" style={{ maxWidth: 760, margin: '30px auto 0' }}>
          <div style={{ textAlign: 'center' }}>
            <p className="ay-note">
                Расчитайте потенциальную урожайность для сада антоновки на основе климатических показателей в выбранные месяцы. 
                Для расчета необходимо ввести среднюю температуру и суммарные осадки в выбранные месяцы.
            </p>
            <a className="ay-btn-outline" href="/months">К услугам</a>
          </div>
        </div>
      </section>
    </>
  );
}


