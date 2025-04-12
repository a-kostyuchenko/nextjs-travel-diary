"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TripCard from "@/app/components/TripCard";

interface Trip {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  totalCost: number | null;
  imageUrl: string | null;
  isPublic: boolean;
  user: {
    id: string;
    name: string;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserTrips = async () => {
      if (!session?.user.id) return;

      try {
        const response = await fetch(`/api/trips?userId=${session.user.id}`);

        if (!response.ok) {
          throw new Error("Ошибка при загрузке путешествий");
        }

        const data = await response.json();
        setTrips(data);
      } catch (error) {
        console.error("Ошибка при загрузке путешествий:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserTrips();
  }, [session]);

  if (!session) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Пожалуйста, войдите в систему для доступа к личному кабинету.</p>
          <div className="mt-4">
            <Link
              href="/auth/login"
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Мои путешествия</h1>
        <Link
          href="/trips/new"
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Новое путешествие
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Загрузка путешествий...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">У вас пока нет путешествий.</p>
          <Link
            href="/trips/new"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            Создать первое путешествие
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div key={trip.id} className="relative">
              {!trip.isPublic && (
                <div className="absolute top-2 right-2 z-10 bg-gray-800 text-white text-xs px-2 py-1 rounded">
                  Приватное
                </div>
              )}
              <TripCard trip={trip} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
