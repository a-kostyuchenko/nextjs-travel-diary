"use client";

import { useState, useEffect } from "react";
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
  user: {
    id: string;
    name: string;
  };
}

export default function ExplorePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/trips");

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

    fetchTrips();
  }, []);

  const filteredTrips = trips.filter((trip) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      trip.title.toLowerCase().includes(searchTermLower) ||
      trip.location.toLowerCase().includes(searchTermLower) ||
      trip.user.name.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Путешествия путешественников</h1>

      <div className="mb-6">
        <label htmlFor="search" className="sr-only">
          Поиск
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <input
            type="search"
            id="search"
            className="block w-full p-4 pl-10 text-sm border border-gray-300 rounded-lg bg-white focus:ring-green-500 focus:border-green-500"
            placeholder="Поиск по названию, месту или автору..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
      ) : filteredTrips.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">
            {searchTerm
              ? "По вашему запросу ничего не найдено. Попробуйте изменить параметры поиска."
              : "Пока нет доступных путешествий."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
