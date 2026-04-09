"use server"

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// 1. ЭКШЕНЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ
// ==========================================
export async function getUsers() {
  return await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createUser(formData: FormData) {
  const login = formData.get('login') as string
  const password = formData.get('password') as string
  if (!login || !password) return;
  await prisma.user.create({ data: { login, password } })
  revalidatePath('/dashboard')
}

export async function deleteUser(id: number) {
  await prisma.user.delete({ where: { id } })
  revalidatePath('/dashboard')
}

// ==========================================
// 2. ЭКШЕНЫ ДЛЯ РЕСТОРАНОВ
// ==========================================
export async function getRestaurants() {
  return await prisma.restaurant.findMany({ orderBy: { name: 'asc' } })
}

export async function createRestaurant(formData: FormData) {
  const name = formData.get('name') as string
  const address = formData.get('address') as string
  if (!name || !address) return;
  await prisma.restaurant.create({
    data: { name, address, manager: String(formData.get('manager')), territorial: String(formData.get('territorial')) }
  })
  revalidatePath('/dashboard/restaurants')
  redirect('/dashboard/restaurants')
}

export async function deleteRestaurant(id: number) {
  await prisma.restaurant.delete({ where: { id } })
  revalidatePath('/dashboard/restaurants')
}

// ==========================================
// 3. ЭКШЕНЫ ДЛЯ КОНСТРУКТОРА ПРЕМИЙ
// ==========================================
export async function getBonusStructure(restaurantId: number) {
  return await prisma.bonusBlock.findMany({
    where: { restaurantId },
    include: { articles: true },
    orderBy: { id: 'asc' }
  })
}

export async function createBonusBlock(formData: FormData) {
  const name = formData.get('name') as string
  const restaurantId = Number(formData.get('restaurantId'))
  if (!name || !restaurantId) return;
  await prisma.bonusBlock.create({ data: { name, restaurantId, weight: 0 } })
  revalidatePath('/dashboard/bonuses/settings')
}

export async function updateBlockWeight(blockId: number, weight: number) {
  if (!blockId) return;
  await prisma.bonusBlock.update({ where: { id: blockId }, data: { weight } });
  revalidatePath('/dashboard/bonuses/fund');
}

export async function updateArticleWeight(articleId: number, weight: number) {
  if (!articleId) return;
  await prisma.bonusArticle.update({ where: { id: articleId }, data: { weight } });
  revalidatePath('/dashboard/bonuses/fund');
}

export async function createBonusArticle(formData: FormData) {
  const name = formData.get('name') as string
  const blockId = Number(formData.get('blockId'))
  if (!name || !blockId) return;
  await prisma.bonusArticle.create({ data: { name, blockId } })
  revalidatePath('/dashboard/bonuses/settings')
}

export async function updateArticleValues(formData: FormData) {
  const id = Number(formData.get('id'));
  const isStrict = formData.get('isStrict') === 'true';
  if (!id) return;
  await prisma.bonusArticle.update({
    where: { id },
    data: { 
      valueFormat: String(formData.get('valueFormat') || "decimal"),
      targetValue: String(formData.get('targetValue') || ""), 
      minValue: isStrict ? null : String(formData.get('minValue') || ""), 
      isStrict,
      isMaxGoal: formData.get('isMaxGoal') === 'true'
    }
  });
  revalidatePath('/dashboard/bonuses/settings');
}

export async function deleteBonusBlock(id: number) {
  await prisma.bonusBlock.delete({ where: { id } })
  revalidatePath('/dashboard/bonuses/settings')
}

export async function deleteBonusArticle(id: number) {
  await prisma.bonusArticle.delete({ where: { id } })
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
    await prisma.bonusFundRule.deleteMany({ where: { restaurantId: Number(restaurantId) } });
    if (rules.length > 0) {
      const dataToInsert = rules.map(rule => ({
        restaurantId: Number(restaurantId),
        condition: rule.condition || 'до',
        threshold: parseFloat(String(rule.threshold).replace(/\s/g, "")) || 0,
        percent: parseFloat(String(rule.percent).replace(/\s/g, "").replace(",", ".")) || 0,
        baseValue: parseFloat(String(rule.baseValue).replace(/\s/g, "")) || 0
      }));
      await prisma.bonusFundRule.createMany({ data: dataToInsert });
    }
    revalidatePath('/dashboard/bonuses/settings');
  } catch (error) {
    throw new Error("Не удалось сохранить сетку фонда");
  }
}

export async function setActiveFundRule(restaurantId: number, ruleId: number | null) {
  if (!restaurantId) return;
  await prisma.restaurant.update({
    where: { id: restaurantId },
    data: { activeFundRuleId: ruleId }
  });
  revalidatePath('/dashboard/bonuses/fund');
}

// ==========================================
// 5. ВЫПОЛНЕНИЕ KPI (ФАКТ)
// ==========================================
export async function getBonusActuals(restaurantId: number, period: string) {
  return await prisma.bonusActual.findMany({
    where: { restaurantId, period }
  });
}

export async function saveBonusActual(restaurantId: number, articleId: number, period: string, value: string) {
  if (!restaurantId || !articleId || !period) return;
  await prisma.bonusActual.upsert({
    where: {
      restaurantId_articleId_period: { restaurantId, articleId, period }
    },
    update: { value },
    create: { restaurantId, articleId, period, value }
  });
  revalidatePath('/dashboard/bonuses/execution');
}

// ==========================================
// 6. ПОКАЗАТЕЛИ И МЕТРИКИ
// ==========================================
export async function getMetrics() {
  return await prisma.metric.findMany({ orderBy: { id: 'desc' } });
}

export async function createMetric(formData: FormData) {
  const name = formData.get('name') as string;
  if (!name) return;
  await prisma.metric.create({ data: { name } });
  revalidatePath('/dashboard/metrics/list');
}

export async function updateMetric(id: number, name: string) {
  if (!id || !name) return;
  await prisma.metric.update({ where: { id }, data: { name } });
  revalidatePath('/dashboard/metrics/list');
  revalidatePath('/dashboard/metrics/targets');
}

export async function deleteMetric(id: number) {
  await prisma.metric.delete({ where: { id } });
  revalidatePath('/dashboard/metrics/list');
  revalidatePath('/dashboard/metrics/targets');
}

export async function getMetricTargets(restaurantId: number) {
  return await prisma.metricTarget.findMany({ where: { restaurantId } });
}

export async function saveMetricTarget(restaurantId: number, metricId: number, value: string) {
  if (!restaurantId || !metricId) return;
  await prisma.metricTarget.upsert({
    where: {
      restaurantId_metricId: { restaurantId, metricId }
    },
    update: { value },
    create: { restaurantId, metricId, value }
  });
  revalidatePath('/dashboard/metrics/targets');
}