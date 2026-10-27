import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Star, X } from "lucide-react";
import type { Servicio } from "@/features/dashboard/types";
import { ThemeContext, formatTranslation, useLocale, useTranslations } from "@/theme/theme";
import { listarReservas, type Reserva } from "../../services/reservaService";
import { getRatingForReservation, type ServiceRating } from "../../services/serviceRatingService";
import "./ServiceRatingsModal.css";

interface ServiceRatingsModalProps {
  servicio: Servicio;
  onClose: () => void;
}

const RESERVATION_BATCH_SIZE = 8;

export const loadServiceRatings = async (serviceId: string): Promise<ServiceRating[]> => {
  const reservations = await listarReservas();
  const eligible = reservations.filter((reservation) =>
    reservation.idServicio === serviceId && reservation.estado === "FINALIZADA",
  );
  const ratings: ServiceRating[] = [];

  for (let offset = 0; offset < eligible.length; offset += RESERVATION_BATCH_SIZE) {
    const batch = await Promise.all(eligible.slice(offset, offset + RESERVATION_BATCH_SIZE).map(async (reservation) => {
      try {
        return await getRatingForReservation(reservation.idReserva);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }
    }));
    ratings.push(...batch.filter((rating): rating is ServiceRating => rating !== null));
  }

  return ratings.sort((left, right) => {
    const leftDate = left.createdAt ? Date.parse(left.createdAt) : 0;
    const rightDate = right.createdAt ? Date.parse(right.createdAt) : 0;
    return rightDate - leftDate;
  });
};

export const ServiceRatingsModal = ({ servicio, onClose }: ServiceRatingsModalProps) => {
  const theme = useContext(ThemeContext);
  const t = useTranslations();
  const locale = useLocale();
  const [ratings, setRatings] = useState<ServiceRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    void loadServiceRatings(servicio.idServicio)
      .then((results) => { if (active) setRatings(results); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [servicio.idServicio]);

  const formatDate = (value: string | null) => {
    if (!value || Number.isNaN(Date.parse(value))) return t("serviceRatings.noDate");
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  };

  return (
    <div className="service-ratings-overlay" role="presentation">
      <section className="service-ratings-modal" role="dialog" aria-modal="true" aria-labelledby="service-ratings-title">
        <header className="service-ratings-header">
          <div>
            <h2 id="service-ratings-title">{formatTranslation(t("serviceRatings.title"), { service: servicio.nombre })}</h2>
          </div>
          <button className="service-ratings-close" type="button" onClick={onClose} aria-label={t("serviceRatings.close")}>
            <X size={20} aria-hidden="true" />
          </button>
        </header>

        {loading ? <p className="service-ratings-state" role="status">{t("serviceRatings.loading")}</p>
          : error ? <p className="service-ratings-error" role="alert">{t("serviceRatings.error")}</p>
            : ratings.length === 0 ? <p className="service-ratings-state">{t("serviceRatings.empty")}</p>
              : <ul className="service-ratings-list">
                {ratings.map((rating) => (
                  <li className="service-rating" key={rating.idCalificacion}>
                    <div className="service-rating-meta">
                      <span className="service-rating-stars" role="img" aria-label={formatTranslation(t("serviceRatings.scoreLabel"), { score: rating.puntuacion })}>
                        {Array.from({ length: 5 }, (_, index) => (
                          <Star key={index} size={19} fill={index < rating.puntuacion ? "currentColor" : "none"} aria-hidden="true" />
                        ))}
                      </span>
                      <strong className="service-rating-score">{rating.puntuacion}/5</strong>
                    </div>
                    {rating.comentario?.trim() && <p className="service-rating-comment"><span>{t("serviceRatings.comment")}:</span> {rating.comentario}</p>}
                    <p className="service-rating-date"><span>{t("serviceRatings.date")}:</span> {formatDate(rating.createdAt)}</p>
                  </li>
                ))}
              </ul>}
      </section>
    </div>
  );
};
