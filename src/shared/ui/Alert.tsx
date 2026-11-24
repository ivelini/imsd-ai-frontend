// Алерт отказа: заголовок и текст зависят от состояния экрана
interface AlertProps {
  title: string;
  text: string;
}

export function Alert({ title, text }: AlertProps) {
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
