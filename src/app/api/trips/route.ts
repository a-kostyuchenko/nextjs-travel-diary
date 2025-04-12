import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Получение всех публичных путешествий
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    const where = {
      isPublic: true,
      ...(userId ? { userId } : {}),
    };

    const trips = await prisma.trip.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(trips);
  } catch (error) {
    console.error("Ошибка при получении путешествий:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Создание нового путешествия
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Необходимо авторизоваться" },
        { status: 401 }
      );
    }

    const {
      title,
      description,
      location,
      startDate,
      endDate,
      latitude,
      longitude,
      totalCost,
      imageUrl,
      isPublic,
      userId,
    } = await request.json();

    // Базовая валидация полей
    if (!title || !description || !location || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Необходимо заполнить все обязательные поля" },
        { status: 400 }
      );
    }

    // Проверка, что пользователь создает запись для себя
    if (userId !== session.user.id) {
      return NextResponse.json(
        { message: "Нет доступа к созданию путешествия для другого пользователя" },
        { status: 403 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        latitude,
        longitude,
        totalCost,
        imageUrl,
        isPublic,
        userId,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    console.error("Ошибка при создании путешествия:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
