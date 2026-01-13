import { HistoryCard } from "@components/HistoryCard";
import { ScreenHeader } from "@components/ScreenHeader";
import { ToastMessage } from "@components/ToastMessage";
import { HistoryFilterDTO } from "@dtos/HistoryFilterDTO";
import { Heading, Text, Toast, useToast, VStack } from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useCallback, useState } from "react";
import { SectionList } from "react-native";

export function History(){
    const [loading, setLoading] = useState(true)
    const [exercises, setExercises] = useState<HistoryFilterDTO>([])

    const toast = useToast()

    const loadHistoryData = async () => {
        try {
            setLoading(true)

            const response = await api.get('/history')

            setExercises(response.data)
        } 
        catch (error) {
            const isAppError= error instanceof AppError

            const title = isAppError ? error.message : 'Not possible to load history data'

            console.log(error.message)

            return toast.show({
                placement: 'top',

                render: ({ id }) => (
                    <ToastMessage
                        id={id} 
                        action="error"
                        title={title}
                        description="" 
                        onClose={
                            ()=> toast.close(id)
                        }
                    />
                ),
            })
        }
        finally{
            setLoading(false)
        }
    }

    useFocusEffect(useCallback(()=>{
        loadHistoryData()
    }, []))
    

    return(
        <VStack flex={1}>
            <ScreenHeader title="Workout History"/>

            <SectionList
                sections={exercises}
                keyExtractor={item => item.id}
                renderItem={ ({item})=> <HistoryCard data={item}/> }
                renderSectionHeader={ ({ section })=> 
                    <Heading color="$gray200" fontSize='$md' mt='$10' mb='$3' fontFamily="$heading">{section.title}</Heading> 
                }
                style={{paddingHorizontal: 32}}
                contentContainerStyle={
                    exercises.length === 0 && { flex: 1, justifyContent: 'center'}
                }
                ListEmptyComponent={()=> (
                    <Text color="gray100" textAlign="center">No exercises registered yet. Lets workout today?</Text>
                )}
                showsVerticalScrollIndicator={false}
            />
            
        </VStack>
    )
}