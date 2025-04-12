import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/app/lib/prisma";

// Получение одного путешествия по id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    const trip = await prisma.trip.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json(
        { message: "Путешествие не найдено" },
        { status: 404 }
      );
    }

    // Проверка прав доступа к непубличным путешествиям
    if (!trip.isPublic &&
        (!session ||
         (session.user.id !== trip.userId))) {
      return NextResponse.json(
        { message: "Нет доступа к этому путешествию" },
        { status: 403 }
      );
    }

    return NextResponse.json(trip);
  } catch (error) {
    console.error("Ошибка при получении путешествия:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Обновление путешествия
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Необходимо авторизоваться" },
        { status: 401 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { message: "Путешествие не найдено" },
        { status: 404 }
      );
    }

    // Проверка, что пользователь редактирует своё путешествие
    if (trip.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Нет доступа к редактированию этого путешествия" },
        { status: 403 }
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
    } = await request.json();

    // Базовая валидация полей
    if (!title || !description || !location || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Необходимо заполнить все обязательные поля" },
        { status: 400 }
      );
    }

    const updatedTrip = await prisma.trip.update({
      where: {
        id: params.id,
      },
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
      },
    });

    return NextResponse.json(updatedTrip);
  } catch (error) {
    console.error("Ошибка при обновлении путешествия:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}

// Удаление путешествия
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Необходимо авторизоваться" },
        { status: 401 }
      );
    }

    const trip = await prisma.trip.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!trip) {
      return NextResponse.json(
        { message: "Путешествие не найдено" },
        { status: 404 }
      );
    }

    // Проверка, что пользователь удаляет своё путешествие
    if (trip.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Нет доступа к удалению этого путешествия" },
        { status: 403 }
      );
    }

    await prisma.trip.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json(
      { message: "Путешествие успешно удалено" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Ошибка при удалении путешествия:", error);
    return NextResponse.json(
      { message: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
