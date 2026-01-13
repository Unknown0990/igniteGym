import { ExerciseCard } from "@components/ExerciseCard";
import { Group } from "@components/Group";
import { HomeHeader } from "@components/HomeHeader";
import { Loading } from "@components/Loading";
import { ToastMessage } from "@components/ToastMessage";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Center, Heading, HStack, Text, useToast, VStack } from "@gluestack-ui/themed";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { AppNavigationRouteProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";

export function Home(){
    const [isLoading, setIsLoading] = useState(true)
    const [groups, setGroups] = useState<string[]>([])
    const [exercises, setExercises] = useState<ExerciseDTO[]>([])
    const [groupSelected, setGroupSelected] = useState('antebraço')

    const navigation = useNavigation<AppNavigationRouteProps>()

    const toast = useToast()

    const handleLoadExerciseDetails = (exerciseID: string) => {
        navigation.navigate('exercise', { exerciseID })
    }

    async function fetchGroups(){
        try {
            const response = await api.get('/groups')

            setGroups(response.data)
        }
        catch (error) {
            const isAppError= error instanceof AppError

            const title = isAppError ? error.message : 'Not possible to load groups'

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
    }

    async function fetchExercisesByGroup(){
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/bygroup/${groupSelected}`)

            setExercises(response.data)
        }
        catch (error) {
            const isAppError= error instanceof AppError

            const title = isAppError ? error.message : 'Not possible to load exercises'

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
            setIsLoading(false)
        }
    }

    useEffect(() => {
      fetchGroups()
    }, [])

    useFocusEffect(useCallback(()=>{
        fetchExercisesByGroup()
    }, [groupSelected]))
    

    return(
        <VStack flex={1}>
            <HomeHeader/>

            <FlatList
                horizontal
                data={groups}
                keyExtractor={item => item}
                renderItem={({item}) => {
                    return(
                        <Group
                            name={item} 
                            isActive={groupSelected.toLowerCase() === item.toLowerCase()} 
                            onPress={()=>setGroupSelected(item)}
                        />
                    )
                }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 32
                }}
                style={{
                    marginVertical: 40,
                    minHeight: 44,
                    maxHeight: 44,
                }}
            />

            { isLoading ? 
                <Loading/> :

                <VStack px='$8' flex={1}>
                    <HStack justifyContent="space-between" alignItems="center" mb='$5'>
                        <Heading color='$gray200' fontSize='$md' fontFamily="$heading">Exercícios</Heading>

                        <Text color='$gray200' fontSize='$sm' fontFamily="$body">{exercises.length}</Text>
                    </HStack>

                    <FlatList
                        data={exercises}
                        keyExtractor={item => item.id}
                        renderItem={({item}) => 
                            <ExerciseCard onPress={
                                ()=> handleLoadExerciseDetails(item.id)
                            } data={item}/>
                        }
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{paddingBottom: 40}}
                    />
                </VStack>
            }
        </VStack>
    )
}