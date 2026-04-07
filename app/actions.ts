"use server"

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// 1. ЭКШЕНЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
// ==========================================

export async function getUsers() {
  return await prisma.user.findMany({ 
    orderBy: { createdAt: 'desc' } 
  })
}

export async function createUser(formData: FormData) {
  const login = formData.get('login') as string
  const password = formData.get('password') as string

  if (!login || !password) return;

  await prisma.user.create({
    data: { login, password }
  })

  revalidatePath('/dashboard')
}

export async function deleteUser(id: number) {
  await prisma.user.delete({
    where: { id }
  })
  revalidatePath('/dashboard')
}

// ==========================================
// 2. ЭКШЕНЫ ДЛЯ РЕСТОРАНОВ
// ==========================================

export async function getRestaurants() {
  return await prisma.restaurant.findMany({ 
    orderBy: { 
      name: 'asc' // Сортируем по имени для удобства вкладок
    } 
  })
}

export async function createRestaurant(formData: FormData) {
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  const manager = formData.get('manager') as string
  const territorial = formData.get('territorial') as string

  if (!name || !address) return;

  await prisma.restaurant.create({
    data: { 
      name, 
      address, 
      manager, 
      territorial 
    }
  })

  revalidatePath('/dashboard/restaurants')
  redirect('/dashboard/restaurants')
}

export async function deleteRestaurant(id: number) {
  await prisma.restaurant.delete({
    where: { id }
  })
  revalidatePath('/dashboard/restaurants')
}

/**
 * Устанавливает активное правило фонда (выбор в таблице)
 */
export async function setActiveFundRule(restaurantId: number, ruleId: number | null) {
  if (!restaurantId) return;

  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { activeFundRuleId: ruleId }
  });

  revalidatePath('/dashboard/bonuses/fund');
}

// ==========================================
// 3. ЭКШЕНЫ ДЛЯ КОНСТРУКТОРА ПРЕМИЙ
// ==========================================

export async function getBonusStructure(restaurantId: number) {
  return await prisma.bonusBlock.findMany({
    where: { restaurantId },
    include: {
      articles: true 
    },
    orderBy: { id: 'asc' }
  })
}

export async function createBonusBlock(formData: FormData) {
  const name = formData.get('name') as string
  const restaurantId = Number(formData.get('restaurantId'))

  if (!name || !restaurantId) return;

  await prisma.bonusBlock.create({
    data: { name, restaurantId, weight: 0 }
  })

  revalidatePath('/dashboard/bonuses/settings')
}

/**
 * Обновляет процентный вес блока (Прибыль - 30% и т.д.)
 */
export async function updateBlockWeight(blockId: number, weight: number) {
  if (!blockId) return;

  await prisma.bonusBlock.update({
    where: { id: blockId },
    data: { weight: weight }
  });

  revalidatePath('/dashboard/bonuses/fund');
}

/**
 * Обновляет процентный вес конкретной статьи внутри блока
 */
export async function updateArticleWeight(articleId: number, weight: number) {
  if (!articleId) return;

  await prisma.bonusArticle.update({
    where: { id: articleId },
    data: { weight: weight }
  });

  revalidatePath('/dashboard/bonuses/fund');
}

export async function createBonusArticle(formData: FormData) {
  const name = formData.get('name') as string
  const blockId = Number(formData.get('blockId'))

  if (!name || !blockId) return;

  await prisma.bonusArticle.create({
    data: { name, blockId }
  })

  revalidatePath('/dashboard/bonuses/settings')
}

export async function updateArticleValues(formData: FormData) {
  const id = Number(formData.get('id'));
  const valueFormat = formData.get('valueFormat') as string;
  const targetValue = formData.get('targetValue') as string;
  const minValue = formData.get('minValue') as string;

  const isStrict = formData.get('isStrict') === 'true';
  const isMaxGoal = formData.get('isMaxGoal') === 'true';

  if (!id) return;

  await prisma.bonusArticle.update({
    where: { id },
    data: { 
      valueFormat: valueFormat || "decimal",
      targetValue: targetValue || null, 
      minValue: isStrict ? null : (minValue || null), 
      isStrict,
      isMaxGoal
    }
  });

  revalidatePath('/dashboard/bonuses/settings');
}

export async function deleteBonusBlock(id: number) {
  await prisma.bonusBlock.delete({
    where: { id }
  })
  revalidatePath('/dashboard/bonuses/settings')
}

export async function deleteBonusArticle(id: number) {
  await prisma.bonusArticle.delete({
    where: { id }
  })
  revalidatePath('/dashboard/bonuses/settings')
}

// ==========================================
// 4. СЕТКА ПРЕМИАЛЬНОГО ФОНДА
// ==========================================

export async function getBonusFundRules(restaurantId: number) {
  return await prisma.bonusFundRule.findMany({
    where: { restaurantId },
    orderBy: { threshold: 'asc' }
  });
}

export async function saveBonusFundRules(restaurantId: number, rules: any[]) {
  if (!restaurantId) return;

  try {
    await prisma.bonusFundRule.deleteMany({
      where: { restaurantId: Number(restaurantId) }
    });

    if (rules.length > 0) {
      const dataToInsert = rules.map(rule => ({
        restaurantId: Number(restaurantId),
        condition: rule.condition || 'до',
        threshold: parseFloat(String(rule.threshold).replace(/\s/g, "")) || 0,
        percent: parseFloat(String(rule.percent).replace(/\s/g, "").replace(",", ".")) || 0,
        baseValue: parseFloat(String(rule.baseValue).replace(/\s/g, "")) || 0
      }));

      await prisma.bonusFundRule.createMany({
        data: dataToInsert
      });
    }

    revalidatePath('/dashboard/bonuses/settings');
  } catch (error) {
    console.error("Ошибка сохранения фонда:", error);
    throw new Error("Не удалось сохранить сетку фонда");
  }
}