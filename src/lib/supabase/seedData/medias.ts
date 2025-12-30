import db from "../db";
import * as schema from "../schema";

const medias = [
  {
    id: "1",
    key: "public/bathroom-planning.jpg",
    alt: "bathroom-planning-category",
  },
  {
    id: "2",
    key: "public/kitchen-planning.jpg",
    alt: "kitchen-planning-category",
  },
  {
    id: "3",
    key: "public/living-room-planning.jpg",
    alt: "living-room-planning-category",
  },
  {
    id: "4",
    key: "public/bedroom-planning.jpg",
    alt: "bedroom-planning-category",
  },
  // Product images
  {
    id: "5",
    key: "public/product-1.jpg",
    alt: "Product 1",
  },
  {
    id: "6",
    key: "public/product-2.jpg",
    alt: "Product 2",
  },
  {
    id: "7",
    key: "public/product-3.jpg",
    alt: "Product 3",
  },
  {
    id: "8",
    key: "public/product-4.jpg",
    alt: "Product 4",
  },
  {
    id: "9",
    key: "public/product-5.jpg",
    alt: "Product 5",
  },
];

const seedMedias = async () => {
  try {
    const insertedMedia = await db
      .insert(schema.medias)
      .values(medias)
      .returning();
    console.log(`Medias are added to the DB.`, insertedMedia);
  } catch (err) {
    console.log("Error happen while inserting Media", err);
  }
};
export default seedMedias;
