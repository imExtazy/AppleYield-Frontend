import { Breadcrumbs } from '../components/Breadcrumbs';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { MINIO_STATIC_BASE } from '../config';

export default function LandingPage() {
  const isHosted = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
  // В mock-режиме (Pages) отключаем видео/оверлеи → класс не добавляем
  const [showVideo, setShowVideo] = useState(!isHosted);
  const baseUrl = (p: string) => {
    const base = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
    return `${base}${p}`;
  };
  const videoSrc = isHosted ? baseUrl('Background_HomePage.mp4') : `${MINIO_STATIC_BASE}/Background_HomePage.mp4`;

  useEffect(() => {
    if (showVideo) {
      document.body.classList.add('ay-landing-page');
    } else {
      document.body.classList.remove('ay-landing-page');
    }
    return () => { document.body.classList.remove('ay-landing-page'); };
  }, [showVideo]);

  return (
    <>
      {showVideo && (
        <div className="ay-video-bg">
          <video
            className="ay-video-el"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            onError={() => setShowVideo(false)}
          />
          <div className="ay-video-overlay" />
        </div>
      )}
      {showVideo && <div className="ay-landing-spacer" />}
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
            <Link className="ay-btn-outline" to="/months">К услугам</Link>
          </div>
        </div>
      </section>
    </>
  );
}


