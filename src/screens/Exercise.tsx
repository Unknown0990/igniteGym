import { VStack, Text, Icon, HStack, Heading, Image, Box, useToast } from "@gluestack-ui/themed";
import { useNavigation, useRoute } from "@react-navigation/native";
import { AppNavigationRouteProps } from "@routes/app.routes";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, TouchableOpacity } from "react-native";

import BodySvg from '@assets/body.svg'
import SeriesSvg from '@assets/series.svg'
import RepetitionSvg from '@assets/repetitions.svg'
import Button from "@components/Button";
import { AppError } from "@utils/AppError";
import { ToastMessage } from "@components/ToastMessage";
import { api } from "@services/api";
import { useEffect, useState } from "react";
import { ExerciseDTO } from "@dtos/ExerciseDTO";
import { Loading } from "@components/Loading";

type RouteParams = {
    exerciseID: string
}


export function Exercise(){

    const [submittingData, setSubmittingData] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const route = useRoute()
    const navigation = useNavigation<AppNavigationRouteProps>()

    const [exercise, setExercise] = useState<ExerciseDTO>({} as ExerciseDTO)

    const { exerciseID } = route.params as RouteParams

    const toast = useToast()

    function handleGoBack(){
        navigation.goBack()
    }

    async function fetchExerciseDetails(){
        try {
            setIsLoading(true)
            const response = await api.get(`/exercises/${exerciseID}`)

            setExercise(response.data)
        }
        catch (error) {
            const isAppError= error instanceof AppError

            const title = isAppError ? error.message : 'Not possible to load exercises details'

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

    async function handleHistoryData(){
        try {
            setSubmittingData(true)

            await api.post('/history', { exercise_id: exerciseID })

            toast.show({
                placement: 'top',

                render: ({ id }) => (
                    <ToastMessage
                        id={id} 
                        action="success"
                        title={'Props for completing exercise!'}
                        description="" 
                        onClose={
                            ()=> toast.close(id)
                        }
                    />
                ),
            })

            navigation.navigate('history')
        }
        catch (error) {
            const isAppError= error instanceof AppError

            const title = isAppError ? error.message : 'Not possible to register exercise'

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
            setSubmittingData(false)
        }
    }

    useEffect(() => {
      fetchExerciseDetails()
    }, [exerciseID])

    return(
        <VStack flex={1}>
            <VStack px='$8' bg='$gray600' pt='$12'>
                <TouchableOpacity onPress={handleGoBack}>
                    <Icon as={ArrowLeft} color='$green500' size='xl'/>
                </TouchableOpacity>

                <HStack 
                    justifyContent="space-between" 
                    alignItems="center" 
                    mt='$4' 
                    mb='$8'
                >
                    <Heading 
                        color='$gray100' 
                        fontFamily="$heading" 
                        fontSize='$lg' 
                        flexShrink={1}
                    >{exercise.name}</Heading>

                    <HStack alignItems="center">
                        <BodySvg/>

                        <Text color='$gray200' ml='$1' textTransform="capitalize">{exercise.group}</Text>
                    </HStack>
                </HStack>
            </VStack>

            { isLoading ? <Loading/> :

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 32}}>
                <VStack p='$8'>
                    <Image source={{uri: `${api.defaults.baseURL}/exercise/demo/${exercise.demo}`}} alt='exercise gif' mb='$3' resizeMode='cover' rounded='$lg' w='$full' h='$80'/>

                    <Box bg='$gray600' rounded='$md' pb='$4' px='$4'>
                        <HStack alignItems="center" justifyContent="space-evenly" mb='$6' mt='$5'>
                            <HStack>
                                <SeriesSvg/>
                                <Text color='$gray200' ml='$2'>{exercise.series} Séries</Text>
                            </HStack>

                            <HStack>
                                <RepetitionSvg/>
                                <Text color='$gray200' ml='$2'>{exercise.repetitions} Repetições</Text>
                            </HStack>
                        </HStack>
                        <Button title='Mark as done' isLoading={submittingData} onPress={handleHistoryData}/>
                    </Box>
                </VStack>
            </ScrollView>
            }
        </VStack>
    )
}