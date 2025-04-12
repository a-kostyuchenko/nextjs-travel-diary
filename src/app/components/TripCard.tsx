"use client";

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TripCardProps {
  trip: {
    id: string;
    title: string;
    description: string;
    location: string;
    startDate: Date;
    endDate: Date;
    totalCost?: number | null;
    imageUrl?: string | null;
    user: {
      name: string;
    };
  };
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48 w-full">
        {trip.imageUrl ? (
          <Image
            src={trip.imageUrl}
            alt={trip.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="bg-gray-200 w-full h-full flex items-center justify-center">
            <span className="text-gray-500">Нет изображения</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{trip.title}</h3>
        <p className="text-gray-600 text-sm">Автор: {trip.user.name}</p>
        <p className="text-sm text-gray-500 mt-1">Место: {trip.location}</p>
        <p className="text-sm text-gray-500">
          {format(new Date(trip.startDate), "dd MMM yyyy", { locale: ru })} -
          {format(new Date(trip.endDate), "dd MMM yyyy", { locale: ru })}
        </p>
        {trip.totalCost && (
          <p className="text-sm text-gray-500">
            Стоимость: {trip.totalCost.toLocaleString()} ₽
          </p>
        )}
        <div className="mt-2">
          <Link
            href={`/trips/${trip.id}`}
            className="text-green-600 hover:text-green-800 text-sm font-medium"
          >
            Подробнее
          </Link>
        </div>
      </div>
    </div>
  );
}
