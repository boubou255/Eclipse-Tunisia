/**
 * Example tours so the site is not empty on first run.
 * Prices, dates and itineraries are placeholders: edit or delete them in /admin.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

type Q = {
  kind: "faq" | "booking";
  inputType?: "text" | "textarea" | "select" | "boolean";
  required?: boolean;
  t: Record<string, { question: string; answer?: string }>;
};

const commonQuestions: Q[] = [
  {
    kind: "faq",
    t: {
      en: { question: "What happens if it is cloudy?", answer: "August skies on the Tunisian coast are usually clear. On eclipse morning our team checks forecasts from dawn and can move the group by coach to a clearer site inside the path." },
      fr: { question: "Et s’il y a des nuages ?", answer: "En août, le ciel de la côte tunisienne est généralement dégagé. Le matin de l’éclipse, notre équipe suit les prévisions dès l’aube et peut déplacer le groupe en car vers un site plus dégagé dans la bande." },
    },
  },
  {
    kind: "faq",
    t: {
      en: { question: "Are eclipse glasses included?", answer: "Yes. Every traveller receives ISO 12312-2 certified eclipse glasses. You only take them off during totality itself, when your guide tells you it is safe." },
      fr: { question: "Les lunettes d’éclipse sont-elles fournies ?", answer: "Oui. Chaque voyageur reçoit des lunettes certifiées ISO 12312-2. On ne les retire que pendant la totalité, lorsque votre guide l’indique." },
    },
  },
  {
    kind: "booking",
    inputType: "select",
    required: true,
    t: {
      en: { question: "Room type", answer: "Double room, Twin room, Single room" },
      fr: { question: "Type de chambre", answer: "Chambre double, Chambre twin, Chambre individuelle" },
    },
  },
  {
    kind: "booking",
    inputType: "textarea",
    t: {
      en: { question: "Dietary needs or allergies" },
      fr: { question: "Régime alimentaire ou allergies" },
    },
  },
  {
    kind: "booking",
    inputType: "boolean",
    t: {
      en: { question: "Are you bringing a camera with a telephoto lens?" },
      fr: { question: "Venez-vous avec un appareil photo et un téléobjectif ?" },
    },
  },
];

const tours = [
  {
    slug: "sfax-centre-line",
    priceEur: 2450,
    durationDays: 5,
    startDate: new Date("2027-07-31T00:00:00Z"),
    capacity: 24,
    viewingSite: "Sfax",
    totality: "≈ 5 min 40 s",
    sortOrder: 1,
    t: {
      en: {
        title: "Sfax on the centre line",
        summary: "Five days in Sfax with a reserved viewing site among the olive groves south of the city.",
        description:
          "This is the tour for people who want the eclipse first and everything else second. We stay in Sfax, close to the centre line, so there is no long transfer on eclipse morning.\n\nThe day before the eclipse we walk the medina and the olive oil souks, and in the evening an astronomer briefs the group on what to watch for during totality: the shadow approaching across the sky, the diamond ring, the corona and the planets that come out.",
        itinerary:
          "Arrival in Sfax\nTransfer from Sfax–Thyna airport or Tunis. Welcome dinner.\n\nThe medina of Sfax\nA guided walk through the walled medina, its souks and the Great Mosque. Free afternoon.\n\nEclipse briefing\nMorning at the viewing site to set up. Evening talk on what to expect and how to photograph totality.\n\nEclipse day\nEarly departure to the viewing site. Totality around 10:10. Celebration lunch.\n\nDeparture\nTransfer to the airport.",
        included: "4 nights in a hotel in Sfax\nAll breakfasts and 3 dinners\nReserved viewing site with shade and water\nISO 12312-2 eclipse glasses\nEnglish- and French-speaking guide\nAirport transfers",
      },
      fr: {
        title: "Sfax sur la ligne centrale",
        summary: "Cinq jours à Sfax avec un site d’observation réservé dans les oliveraies au sud de la ville.",
        description:
          "Le circuit pour celles et ceux qui viennent d’abord pour l’éclipse. Nous logeons à Sfax, près de la ligne centrale : pas de long transfert le matin de l’éclipse.\n\nLa veille, nous visitons la médina et les souks de l’huile d’olive, puis un astronome présente au groupe ce qu’il faut observer pendant la totalité : l’ombre qui avance dans le ciel, l’anneau de diamant, la couronne et les planètes qui apparaissent.",
        itinerary:
          "Arrivée à Sfax\nTransfert depuis l’aéroport de Sfax–Thyna ou de Tunis. Dîner de bienvenue.\n\nLa médina de Sfax\nVisite guidée de la médina, de ses souks et de la Grande Mosquée. Après-midi libre.\n\nBriefing éclipse\nMatinée sur le site d’observation pour s’installer. Conférence le soir sur la totalité et la photo.\n\nJour de l’éclipse\nDépart tôt vers le site. Totalité vers 10 h 10. Déjeuner de fête.\n\nDépart\nTransfert vers l’aéroport.",
        included: "4 nuits d’hôtel à Sfax\nPetits-déjeuners et 3 dîners\nSite d’observation réservé, ombre et eau\nLunettes d’éclipse ISO 12312-2\nGuide anglophone et francophone\nTransferts aéroport",
      },
    },
  },
  {
    slug: "kerkennah-islands",
    priceEur: 1980,
    durationDays: 4,
    startDate: new Date("2027-08-01T00:00:00Z"),
    capacity: 16,
    viewingSite: "Kerkennah Islands",
    totality: "≈ 5 min 44 s",
    sortOrder: 2,
    t: {
      en: {
        title: "Kerkennah Islands",
        summary: "A quiet island stay off the coast of Sfax, watching totality over the sea.",
        description:
          "The Kerkennah Islands lie a short ferry ride from Sfax and see slightly longer totality than the mainland. The islands are flat and low, so the horizon is open in every direction: a good place to watch the Moon’s shadow race in across the water.\n\nGroups are small and the pace is slow: fishing villages, palm groves and the sea.",
        itinerary:
          "Ferry to Kerkennah\nMeet in Sfax and cross to the islands. Dinner by the sea.\n\nEclipse day\nViewing site on the coast. Totality around 10:10. Afternoon at leisure.\n\nIsland life\nBoat trip with local fishermen and lunch on board.\n\nReturn to Sfax\nFerry back and transfer to the airport.",
        included: "3 nights on the islands\nAll breakfasts and dinners\nFerry crossings\nReserved coastal viewing site\nISO 12312-2 eclipse glasses\nBoat trip",
      },
      fr: {
        title: "Îles Kerkennah",
        summary: "Un séjour paisible au large de Sfax, avec la totalité au-dessus de la mer.",
        description:
          "Les îles Kerkennah sont à une courte traversée de Sfax et profitent d’une totalité un peu plus longue que sur le continent. Les îles sont plates : l’horizon est dégagé de tous côtés, idéal pour voir l’ombre de la Lune arriver sur la mer.\n\nPetits groupes, rythme tranquille : villages de pêcheurs, palmeraies et mer.",
        itinerary:
          "Traversée vers Kerkennah\nRendez-vous à Sfax et traversée. Dîner au bord de la mer.\n\nJour de l’éclipse\nSite d’observation sur la côte. Totalité vers 10 h 10. Après-midi libre.\n\nLa vie sur l’île\nSortie en mer avec des pêcheurs et déjeuner à bord.\n\nRetour à Sfax\nTraversée retour et transfert vers l’aéroport.",
        included: "3 nuits sur les îles\nPetits-déjeuners et dîners\nTraversées en ferry\nSite d’observation réservé sur la côte\nLunettes d’éclipse ISO 12312-2\nSortie en bateau",
      },
    },
  },
  {
    slug: "carthage-to-the-sahara",
    priceEur: 3690,
    durationDays: 9,
    startDate: new Date("2027-07-29T00:00:00Z"),
    capacity: 20,
    viewingSite: "Sfax",
    totality: "≈ 5 min 40 s",
    sortOrder: 3,
    t: {
      en: {
        title: "From Carthage to the Sahara",
        summary: "Nine days across Tunisia: Carthage, El Jem, the eclipse at Sfax, then south to the desert.",
        description:
          "A full journey through Tunisia built around the eclipse. We start among the ruins of Carthage, stop at the Roman amphitheatre of El Jem, and are in Sfax for totality.\n\nAfter the eclipse we drive south to Matmata and Douz, at the edge of the Sahara, for nights under dark desert skies.",
        itinerary:
          "Tunis\nArrival and welcome dinner.\n\nCarthage and Sidi Bou Said\nThe Punic and Roman city, then the blue and white village above the sea.\n\nEl Jem\nThe Roman amphitheatre, then on to Sfax.\n\nSfax\nMedina walk and evening eclipse briefing.\n\nEclipse day\nTotality around 10:10 at our viewing site near Sfax.\n\nMatmata\nDrive south to the troglodyte houses of Matmata.\n\nDouz and the Sahara\nCamel ride into the dunes and a night at a desert camp.\n\nTozeur\nThe oasis and the Chott el Djerid salt lake.\n\nDeparture\nFlight home from Tozeur or Tunis.",
        included: "8 nights in hotels and one desert camp\nAll breakfasts and dinners\nPrivate coach and driver\nReserved viewing site near Sfax\nISO 12312-2 eclipse glasses\nEntrance fees at listed sites",
      },
      fr: {
        title: "De Carthage au Sahara",
        summary: "Neuf jours à travers la Tunisie : Carthage, El Jem, l’éclipse à Sfax, puis le désert.",
        description:
          "Un vrai voyage en Tunisie construit autour de l’éclipse. Nous commençons par les ruines de Carthage, faisons halte à l’amphithéâtre d’El Jem, et sommes à Sfax pour la totalité.\n\nAprès l’éclipse, nous descendons vers Matmata et Douz, aux portes du Sahara, pour des nuits sous le ciel noir du désert.",
        itinerary:
          "Tunis\nArrivée et dîner de bienvenue.\n\nCarthage et Sidi Bou Saïd\nLa cité punique et romaine, puis le village bleu et blanc.\n\nEl Jem\nL’amphithéâtre romain, puis route vers Sfax.\n\nSfax\nVisite de la médina et briefing éclipse.\n\nJour de l’éclipse\nTotalité vers 10 h 10 sur notre site près de Sfax.\n\nMatmata\nRoute vers les maisons troglodytes de Matmata.\n\nDouz et le Sahara\nBalade à dos de dromadaire et nuit au campement.\n\nTozeur\nL’oasis et le chott el-Djérid.\n\nDépart\nVol retour depuis Tozeur ou Tunis.",
        included: "8 nuits en hôtels et une nuit au campement\nPetits-déjeuners et dîners\nCar privé avec chauffeur\nSite d’observation réservé près de Sfax\nLunettes d’éclipse ISO 12312-2\nEntrées des sites mentionnés",
      },
    },
  },
];

async function main() {
  const existing = await db.tour.count();
  if (existing > 0) {
    console.log(`Database already has ${existing} tours; skipping seed.`);
    return;
  }
  for (const tour of tours) {
    const { t, ...base } = tour;
    await db.tour.create({
      data: {
        ...base,
        published: true,
        translations: { create: Object.entries(t).map(([locale, v]) => ({ locale, ...v })) },
        questions: {
          create: commonQuestions.map((q, i) => ({
            kind: q.kind,
            inputType: q.inputType ?? "text",
            required: q.required ?? false,
            sortOrder: i,
            translations: {
              create: Object.entries(q.t).map(([locale, v]) => ({ locale, question: v.question, answer: v.answer ?? "" })),
            },
          })),
        },
      },
    });
  }
  console.log(`Seeded ${tours.length} tours.`);
}

main().finally(() => db.$disconnect());
