import { ReactElement } from 'react';

export default function UseCase({
  title,
  description,
  icon,
  className,
}: {
  title: string;
  description: string;
  icon?: ReactElement;
  className?: string;
}) {
  return (
    <div
      className={`bg-box-secondary flex flex-row items-center rounded-lg p-4 md:flex-row ${
        className ? className : ''
      }`}
    >
      <div className="flex min-h-40 w-full flex-col items-center justify-center p-4 md:px-4">
        <h2 className="text-center text-xl font-bold">{title}</h2>
        <div className="h-20 pb-4 pt-8">{icon}</div>
        <p className="text-center text-sm">{description}</p>
      </div>
    </div>
  );
}
