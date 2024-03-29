import Stripe from 'stripe';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Create Checkout Sessions from body params.
      const params = {
        submit_type: 'pay',
        mode: 'payment',
        payment_method_types: ['card'],
        shipping_address_collection: {allowed_countries: ['US', 'CA']},
        shipping_options: [
            {shipping_rate: 'shr_1MHdh7K4M28rgDjhD2iXMps1'},
            {shipping_rate: 'shr_1MHdi0K4M28rgDjhTK4MWxeS'}
        ],
        automatic_tax: {
          enabled: true,
        },
        line_items: req.body.map((item) => {
            const img = item.image[0].asset._ref;
            //const newImage = img.replace('image-', 'https://cdn.sanity.io/images/ouwf753a/production/').replace('-png', '.webp');

            return{
                price_data: {
                    currency: 'cad',
                    tax_behavior: "exclusive",
                    product_data: {
                        name: item.name,
                        images: [img],
                    },
                    unit_amount: item.price * 100,
                },
                adjustable_quantity: {
                    enabled: true,
                    minimum: 1,
                },
                quantity: item.quantity
            }
        }),
        success_url: `${req.headers.origin}/success`,
        cancel_url: `${req.headers.origin}/?canceled=true`,
    }
      const session = await stripe.checkout.sessions.create(params);
      res.status(200).json(session);
    } catch (err) {
      res.status(err.statusCode || 500).json(err.message);
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}