import { getUncachableStripeClient } from "./stripeClient";

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  const products = await stripe.products.search({ query: "name:'HUB Pro'" });
  if (products.data.length > 0) {
    console.log("HUB Pro already exists:", products.data[0].id);
    const prices = await stripe.prices.list({ product: products.data[0].id, active: true });
    console.log("Price:", prices.data[0]?.id, "$" + ((prices.data[0]?.unit_amount || 0) / 100));
    return;
  }

  const product = await stripe.products.create({
    name: "HUB Pro",
    description: "Unlimited app connections, advanced security, priority support. One login for your entire digital life.",
    metadata: {
      plan: "pro",
      tier: "premium",
    },
  });

  const monthlyPrice = await stripe.prices.create({
    product: product.id,
    unit_amount: 2500,
    currency: "usd",
    recurring: { interval: "month" },
    metadata: { plan: "pro_monthly" },
  });

  console.log("Created product:", product.id);
  console.log("Created price:", monthlyPrice.id, "- $25.00/month");
}

seedProducts().catch(console.error);
