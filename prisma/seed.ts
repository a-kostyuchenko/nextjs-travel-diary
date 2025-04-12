import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Начинаем заполнение базы данных тестовыми данными...');

  // Создаем пользователей
  const password = await hash('password123', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      name: 'Иван Петров',
      email: 'user1@example.com',
      password,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      name: 'Мария Сидорова',
      email: 'user2@example.com',
      password,
    },
  });

  console.log(`Создано 2 пользователя`);

  // Создаем путешествия
  const trips = [
    {
      title: 'Поездка в Санкт-Петербург',
      description: 'Удивительное путешествие в культурную столицу России. Посетили Эрмитаж, Петергоф и другие достопримечательности.',
      location: 'Санкт-Петербург, Россия',
      startDate: new Date('2023-06-10'),
      endDate: new Date('2023-06-17'),
      latitude: 59.9343,
      longitude: 30.3351,
      totalCost: 45000,
      imageUrl: 'https://via.placeholder.com/800x600?text=Санкт-Петербург',
      isPublic: true,
      userId: user1.id,
    },
    {
      title: 'Отдых в Сочи',
      description: 'Прекрасный отпуск на Черноморском побережье. Чистое море, жаркое солнце и вкусная еда!',
      location: 'Сочи, Россия',
      startDate: new Date('2023-07-20'),
      endDate: new Date('2023-07-31'),
      latitude: 43.6028,
      longitude: 39.7342,
      totalCost: 65000,
      imageUrl: 'https://via.placeholder.com/800x600?text=Сочи',
      isPublic: true,
      userId: user1.id,
    },
    {
      title: 'Выходные в Казани',
      description: 'Короткая поездка на выходные в Казань. Посетили Казанский Кремль и другие интересные места.',
      location: 'Казань, Россия',
      startDate: new Date('2023-08-12'),
      endDate: new Date('2023-08-14'),
      latitude: 55.7887,
      longitude: 49.1221,
      totalCost: 20000,
      imageUrl: 'https://via.placeholder.com/800x600?text=Казань',
      isPublic: false,
      userId: user1.id,
    },
    {
      title: 'Поход на Алтай',
      description: 'Незабываемый поход по Горному Алтаю. Красивейшие пейзажи, чистый воздух и полное единение с природой.',
      location: 'Горный Алтай, Россия',
      startDate: new Date('2023-06-01'),
      endDate: new Date('2023-06-10'),
      latitude: 50.7747,
      longitude: 86.1566,
      totalCost: 35000,
      imageUrl: 'https://via.placeholder.com/800x600?text=Алтай',
      isPublic: true,
      userId: user2.id,
    },
    {
      title: 'Отпуск в Турции',
      description: 'Замечательный отдых в Анталии. All-inclusive отель, теплое море и множество экскурсий.',
      location: 'Анталия, Турция',
      startDate: new Date('2023-09-05'),
      endDate: new Date('2023-09-15'),
      latitude: 36.8969,
      longitude: 30.7133,
      totalCost: 80000,
      imageUrl: 'https://via.placeholder.com/800x600?text=Турция',
      isPublic: true,
      userId: user2.id,
    },
  ];

  // Удаляем все существующие путешествия
  await prisma.trip.deleteMany({});

  // Создаем новые путешествия
  for (const trip of trips) {
    await prisma.trip.create({
      data: trip,
    });
  }

  console.log(`Создано ${trips.length} путешествий`);
  console.log('Заполнение базы данных завершено!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
