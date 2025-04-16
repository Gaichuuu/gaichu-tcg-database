import { collection, getDocs, limit, query, where } from 'firebase/firestore';
import { database } from '../config/FirebaseConfig';
import { CollectionCard } from '../types/CollectionCard';
const collectionName = "cards";

export const fetchCards = async (setShortName: string): Promise <CollectionCard[]> => {
    const cardsReference = collection(database, collectionName);
    const cardsQuery = query(
            cardsReference,
            where('set_short_name', "==" ,setShortName)
        );

    const cardsSnapshot = await getDocs(cardsQuery);
    const cards = cardsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
    })) as CollectionCard[];
    return cards
}

export const fetchCardDetail = async (cardName: string): Promise <CollectionCard | null> => {
    const cardsReference = collection(database, collectionName);
    const cardsQuery = query(
        cardsReference,
        where('name', "==" ,cardName),
        limit(1)
    );

        const cardsSnapshot = await getDocs(cardsQuery);
        if (cardsSnapshot.empty) return null;

        const doc = cardsSnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as CollectionCard;
}