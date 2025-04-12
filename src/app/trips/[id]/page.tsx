"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/app/components/MapComponent"), {
  ssr: false,
});

interface TripDetailPageProps {
  params: {
    id: string;
  };
}

interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  latitude: number | null;
  longitude: number | null;
  totalCost: number | null;
  imageUrl: string | null;
  isPublic: boolean;
  user: {
    id: string;
    name: string;
    image: string | null;
  };
}

export default function TripDetailPage({ params }: TripDetailPageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await fetch(`/api/trips/${params.id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Путешествие не найдено");
          } else if (response.status === 403) {
            throw new Error("У вас нет доступа к этому путешествию");
          } else {
            throw new Error("Ошибка при загрузке путешествия");
          }
        }

        const data = await response.json();
        setTrip(data);
      } catch (error) {
        console.error("Ошибка при загрузке путешествия:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить это путешествие?")) {
      return;
    }

    try {
      const response = await fetch(`/api/trips/${params.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Ошибка при удалении путешествия");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Ошибка при удалении путешествия:", error);
      alert("Ошибка при удалении путешествия");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link
            href="/explore"
            className="text-green-600 hover:text-green-800"
          >
            Вернуться к списку путешествий
          </Link>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Путешествие не найдено</p>
        </div>
      </div>
    );
  }

  const isOwner = session?.user.id === trip.user.id;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {trip.imageUrl && (
          <div className="relative h-64 w-full">
            <Image
              src={trip.imageUrl}
              alt={trip.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold mb-2">{trip.title}</h1>
              <p className="text-gray-600 mb-4">
                Автор: {trip.user.name}
              </p>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <Link
                  href={`/trips/${trip.id}/edit`}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Редактировать
                </Link>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Удалить
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Детали путешествия</h2>
              <p className="text-gray-700 mb-4">{trip.description}</p>

              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>Место:</strong> {trip.location}
                </p>
                <p className="text-gray-700">
                  <strong>Период:</strong>{" "}
                  {format(new Date(trip.startDate), "d MMMM yyyy", { locale: ru })} -{" "}
                  {format(new Date(trip.endDate), "d MMMM yyyy", { locale: ru })}
                </p>
                {trip.totalCost !== null && (
                  <p className="text-gray-700">
                    <strong>Стоимость:</strong> {trip.totalCost.toLocaleString()} ₽
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Расположение</h2>
              {trip.latitude && trip.longitude ? (
                <MapComponent
                  latitude={trip.latitude}
                  longitude={trip.longitude}
                />
              ) : (
                <div className="bg-gray-100 rounded-lg p-6 text-center">
                  <p className="text-gray-500">Координаты местоположения не указаны</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link href="/explore" className="text-green-600 hover:text-green-800">
          Вернуться к списку путешествий
        </Link>
      </div>
    </div>
  );
}
