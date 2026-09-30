// Алерт отказа записи: заголовок и текст зависят от состояния экрана
interface BookingAlertProps {
  title: string;
  text: string;
}

export function BookingAlert({ title, text }: BookingAlertProps) {
  return (
    <div className="alert alert--error">
      <img src="/assets/img/warning.svg" alt="" />
      <div>
        <p className="alert-title">{title}</p>
        <p className="alert-text">{text}</p>
      </div>
    </div>
  );
}
