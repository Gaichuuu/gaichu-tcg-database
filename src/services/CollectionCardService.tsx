import { collection, getDocs, query, where } from 'firebase/firestore';
import { database } from '../config/FirebaseConfig';
import { CollectionCard } from '../types/CollectionCard';

export const fetchCards = async (setShortName: string): Promise <CollectionCard[]> => {
    const cardsReference = collection(database, "cards");
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
