import { PrismaClient } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { config } from "dotenv";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env file
config();

const prisma = new PrismaClient();

// Функция ensureSystemUser больше не нужна, так как группы слов теперь могут быть глобальными

interface WordData {
  groupName: string;
  english: string;
  russian: string;
  description: string;
}

/**
 * Парсит CSV файл с группированными словами
 */
function parseWordsCSV(): WordData[] {
  const csvPath = path.join(
    process.cwd(),
    "src",
    "shared",
    "seed",
    ".data",
    "describing_people_during_lesson.csv",
  );

  if (!fs.existsSync(csvPath)) {
    throw new Error(`CSV файл не найден: ${csvPath}`);
  }

  const csvContent = fs.readFileSync(csvPath, "utf-8");

  const records = parse(csvContent, {
    columns: ["groupName", "english", "russian", "description"],
    skip_empty_lines: true,
    trim: true,
    from_line: 2, // Пропускаем первую строку с заголовками
  });

  return records as WordData[];
}

/**
 * Группирует слова по группам
 */
function groupWordsByCategory(words: WordData[]): Map<string, WordData[]> {
  const groupedWords = new Map<string, WordData[]>();

  for (const wordData of words) {
    const { groupName } = wordData;
    if (!groupedWords.has(groupName)) {
      groupedWords.set(groupName, []);
    }
    groupedWords.get(groupName)!.push(wordData);
  }

  return groupedWords;
}

/**
 * Заполняет базу данных группами слов и словами
 */
export async function seedWordsAndGroups() {
  console.log("🌱 Начинаем заполнение базы данных словами и группами...");

  try {
    // Парсим CSV файл
    console.log("📄 Парсим CSV файл с данными...");
    const wordsData = parseWordsCSV();
    console.log(`📊 Найдено ${wordsData.length} записей в CSV файле`);

    // Группируем слова по категориям
    const groupedWords = groupWordsByCategory(wordsData);
    console.log(`📚 Найдено ${groupedWords.size} групп слов`);

    let createdGroups = 0;
    let createdWords = 0;

    // Создаем группы и слова
    for (const [groupName, wordDataList] of groupedWords) {
      try {
        // Берем описание группы из первого слова (все слова в группе имеют одинаковое описание группы)
        const groupDescription =
          wordDataList.length > 0
            ? `Words group: ${groupName}`
            : `Words group: ${groupName}`;

        // Создаем или обновляем группу
        const wordGroup = await prisma.wordGroup.upsert({
          where: {
            name: groupName,
          },
          create: {
            name: groupName,
            description: groupDescription,
            isGlobal: true, // Создаем глобальную группу
          },
          update: {
            description: groupDescription,
          },
        });
        createdGroups++;
        console.log(`✅ Обработана группа: ${groupName}`);

        // Создаем или обновляем слова для группы
        for (const wordData of wordDataList) {
          try {
            await prisma.word.upsert({
              where: {
                english_groupId: {
                  english: wordData.english,
                  groupId: wordGroup.id,
                },
              },
              create: {
                english: wordData.english,
                russian: wordData.russian,
                description: wordData.description,
                groupId: wordGroup.id,
              },
              update: {
                russian: wordData.russian,
                description: wordData.description,
              },
            });
            createdWords++;
          } catch (error) {
            console.error(
              `❌ Ошибка при обработке слова "${wordData.english}" в группе "${groupName}":`,
              error,
            );
          }
        }

        console.log(
          `📝 Обработано слов в группе "${groupName}": ${wordDataList.length}`,
        );
      } catch (error) {
        console.error(`❌ Ошибка при создании группы "${groupName}":`, error);
      }
    }

    console.log("\n📊 Результаты заполнения:");
    console.log(`✅ Обработано групп: ${createdGroups}`);
    console.log(`✅ Обработано слов: ${createdWords}`);
    console.log("🎉 Заполнение базы данных завершено успешно!");
  } catch (error) {
    console.error("❌ Ошибка при заполнении базы данных:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Если файл запускается напрямую
seedWordsAndGroups()
  .then(() => {
    console.log("✅ Seed скрипт выполнен успешно");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Ошибка выполнения seed скрипта:", error);
    process.exit(1);
  });
