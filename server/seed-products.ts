import { getUncachableStripeClient } from "./stripeClient";

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  const products = await stripe.products.search({ query: "name:'HUB Pro'" });
  if (products.data.length > 0) {
    const existingProduct = products.data[0];
    console.log("HUB Pro already exists:", existingProduct.id);
    const prices = await stripe.prices.list({ product: existingProduct.id, active: true });
    
    const correctPrice = prices.data.find(p => p.unit_amount === 2500 && p.recurring?.interval === "month");
    if (correctPrice) {
      console.log("$25/month price already exists:", correctPrice.id);
    } else {
      const newPrice = await stripe.prices.create({
        product: existingProduct.id,
        unit_amount: 2500,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { plan: "pro_monthly" },
      });
      console.log("Created new $25/month price:", newPrice.id);
    }

    for (const p of prices.data) {
      if (p.unit_amount !== 2500 && p.active) {
        await stripe.prices.update(p.id, { active: false });
        console.log("Deactivated old price:", p.id, "$" + ((p.unit_amount || 0) / 100));
      }
    }
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
