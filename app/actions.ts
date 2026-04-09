"use server"

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// ==========================================
// 1. ПОЛЬЗОВАТЕЛИ И РЕСТОРАНЫ
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
// 2. КОНСТРУКТОР ПРЕМИЙ (МАГИЯ СБОРКИ)
// ==========================================
export async function getBonusStructure(restaurantId: number) {
  const blocks = await prisma.bonusBlock.findMany({
    where: { restaurantId },
    include: {
      articles: {
        include: {
          metric: {
            include: {
              targets: { where: { restaurantId } } // Берем цели конкретного ресторана
            }
          }
        }
      }
    },
    orderBy: { id: 'asc' }
  });

  // Возвращаем данные в плоском формате, чтобы не ломать клиентские компоненты
  return blocks.map(block => ({
    ...block,
    articles: block.articles.map(art => {
      const target = art.metric?.targets?.[0] || {};
      return {
        id: art.id,
        metricId: art.metricId,
        name: art.metric?.name || "Неизвестная метрика",
        weight: art.weight,
        targetValue: target.targetValue || "",
        minValue: target.minValue || "",
        isStrict: target.isStrict || false,
        isMaxGoal: target.isMaxGoal || false,
        valueFormat: target.valueFormat || "decimal",
      };
    })
  }));
}

export async function createBonusBlock(formData: FormData) {
  const name = formData.get('name') as string
  const restaurantId = Number(formData.get('restaurantId'))
  if (!name || !restaurantId) return;
  await prisma.bonusBlock.create({ data: { name, restaurantId, weight: 0 } })
  revalidatePath('/dashboard/bonuses/settings')
}

export async function deleteBonusBlock(id: number) {
  await prisma.bonusBlock.delete({ where: { id } })
  revalidatePath('/dashboard/bonuses/settings')
}

export async function createBonusArticle(formData: FormData) {
  const metricId = Number(formData.get('metricId'))
  const blockId = Number(formData.get('blockId'))
  if (!metricId || !blockId) return;
  await prisma.bonusArticle.create({ data: { metricId, blockId } })
  revalidatePath('/dashboard/bonuses/settings')
  revalidatePath('/dashboard/bonuses/fund')
  revalidatePath('/dashboard/bonuses/execution')
}

export async function deleteBonusArticle(id: number) {
  await prisma.bonusArticle.delete({ where: { id } })
  revalidatePath('/dashboard/bonuses/settings')
  revalidatePath('/dashboard/bonuses/fund')
  revalidatePath('/dashboard/bonuses/execution')
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

// ==========================================
// 3. ФОНД
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
// 4. ВЫПОЛНЕНИЕ KPI (ФАКТ)
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
// 5. ПОКАЗАТЕЛИ И МЕТРИКИ
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
  revalidatePath('/dashboard/bonuses/settings');
}

export async function deleteMetric(id: number) {
  await prisma.metric.delete({ where: { id } });
  revalidatePath('/dashboard/metrics/list');
  revalidatePath('/dashboard/metrics/targets');
  revalidatePath('/dashboard/bonuses/settings');
}

export async function getMetricTargets(restaurantId: number) {
  return await prisma.metricTarget.findMany({ where: { restaurantId } });
}

export async function updateMetricTargetValues(formData: FormData) {
  const restaurantId = Number(formData.get('restaurantId'));
  const metricId = Number(formData.get('metricId'));
  const valueFormat = String(formData.get('valueFormat') || "decimal");
  const targetValue = String(formData.get('targetValue') || "");
  const isStrict = formData.get('isStrict') === 'true';
  const minValue = isStrict ? null : String(formData.get('minValue') || "");
  const isMaxGoal = formData.get('isMaxGoal') === 'true';

  if (!restaurantId || !metricId) return;

  await prisma.metricTarget.upsert({
    where: { restaurantId_metricId: { restaurantId, metricId } },
    update: { valueFormat, targetValue, minValue, isStrict, isMaxGoal },
    create: { restaurantId, metricId, valueFormat, targetValue, minValue, isStrict, isMaxGoal }
  });
  
  revalidatePath('/dashboard/metrics/targets');
  revalidatePath('/dashboard/bonuses/settings');
  revalidatePath('/dashboard/bonuses/execution');
  revalidatePath('/dashboard/bonuses/fund');
}