"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/app/components/MapComponent"), {
  ssr: false,
});

interface EditTripPageProps {
  params: {
    id: string;
  };
}

interface TripData {
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
  userId: string;
}

export default function EditTripPage({ params }: EditTripPageProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState<TripData>({
    title: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
    latitude: null,
    longitude: null,
    totalCost: null,
    imageUrl: null,
    isPublic: true,
    userId: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

        const trip = await response.json();

        // Проверяем, что пользователь является владельцем
        if (session?.user.id !== trip.userId) {
          router.push(`/trips/${params.id}`);
          return;
        }

        // Форматируем даты в формат yyyy-MM-dd для input[type="date"]
        const formattedStartDate = format(new Date(trip.startDate), "yyyy-MM-dd");
        const formattedEndDate = format(new Date(trip.endDate), "yyyy-MM-dd");

        setFormData({
          ...trip,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });

        if (trip.imageUrl) {
          setPreviewUrl(trip.imageUrl);
        }
      } catch (error) {
        console.error("Ошибка при загрузке путешествия:", error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user.id) {
      fetchTrip();
    }
  }, [params.id, session, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else if (name === "totalCost") {
      // Убираем все символы, кроме цифр и точки
      const sanitizedValue = value.replace(/[^\d.]/g, "");
      setFormData({
        ...formData,
        [name]: sanitizedValue === "" ? null : parseFloat(sanitizedValue),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);

      // Создаем URL для предпросмотра
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.imageUrl;

    // В реальном приложении здесь был бы код загрузки изображения на сервер
    // и получение URL. Для простоты будем использовать фейковый URL
    return URL.createObjectURL(imageFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      if (!session?.user.id) {
        throw new Error("Необходимо авторизоваться");
      }

      // Проверка, что пользователь редактирует своё путешествие
      if (session.user.id !== formData.userId) {
        throw new Error("У вас нет доступа к редактированию этого путешествия");
      }

      // Загружаем изображение и получаем URL
      const imageUrl = await uploadImage();

      const tripData = {
        ...formData,
        imageUrl,
      };

      const response = await fetch(`/api/trips/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Ошибка при обновлении путешествия");
      }

      router.push(`/trips/${params.id}`);
    } catch (error) {
      console.error("Ошибка обновления путешествия:", error);
      setError((error as Error).message || "Ошибка при обновлении путешествия");
    } finally {
      setIsSaving(false);
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
          <button
            onClick={() => router.back()}
            className="text-green-600 hover:text-green-800"
          >
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Редактирование путешествия</h1>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Название путешествия
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            required
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Местоположение
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Например: Париж, Франция"
            />
          </div>

          <div>
            <label htmlFor="totalCost" className="block text-sm font-medium text-gray-700">
              Общая стоимость (₽)
            </label>
            <input
              type="text"
              id="totalCost"
              name="totalCost"
              value={formData.totalCost === null ? "" : formData.totalCost}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
              placeholder="Например: 50000"
            />
          </div>

          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Дата начала
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              required
              value={formData.startDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              Дата окончания
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              required
              value={formData.endDate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Изображение
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1 block w-full py-2 px-3"
          />
          {previewUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Предпросмотр:</p>
              <img
                src={previewUrl}
                alt="Preview"
                className="mt-1 h-40 w-auto object-cover rounded-md"
              />
            </div>
          )}
        </div>

        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">
            Местоположение на карте (щелкните по карте, чтобы изменить)
          </p>
          <MapComponent
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationSelect={handleLocationSelect}
            editable
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleChange}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Сделать путешествие публичным
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => router.push(`/trips/${params.id}`)}
            className="mr-3 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="bg-green-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}
