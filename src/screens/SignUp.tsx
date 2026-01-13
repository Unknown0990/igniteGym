import { VStack, Image, Center, Text, Heading, ScrollView, useToast, Toast, ToastTitle } from "@gluestack-ui/themed";

import BackgroundImg from '@assets/background.png'
import Logo from '@assets/logo.svg'
import { Input } from "../components/Input";
import Button from "@components/Button";
import { useNavigation } from "@react-navigation/native";
import { AuthNavigatorRoutesProps } from "@routes/auth.routes";
import { Controller, useForm } from "react-hook-form";

import { yupResolver } from '@hookform/resolvers/yup'

import * as yup from 'yup'
import { api } from "@services/api";
import axios from "axios";
import { Alert } from "react-native";
import { AppError } from "@utils/AppError";
import { ToastMessage } from "@components/ToastMessage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useAuth } from "@hooks/useAuth";

type FormDataProps = {
    name: string;
    email: string;
    password: string;
    password_confirm: string;
}

const signUpSchema = yup.object({
    name: yup.string().required('Inform your name'),
    email: yup.string().required('Inform your email').email("Email invalid"),
    password: yup.string().required('Inform the password').min(6, 'Password must contain at least 6 digits'),
    password_confirm: yup.string().required('Inform the password').oneOf([yup.ref('password'), ''], 'Passwords dont match')
})

export function SignUp(){
    const [isLoading, setIsLoading] = useState(false)
    
    const toast = useToast()
    
    const { signIn } = useAuth()

    const navigation = useNavigation<AuthNavigatorRoutesProps>()

    // const { control, handleSubmit } = useForm<FormDataProps>({
    //     defaultValues: {
    //         name: 'Eduardo',
    //         email: 'unk@gmail.com',
    //         password: '1234',
    //         password_confirm: '1234'
    //     }
    // })

    const { control, handleSubmit, formState: { errors } } = useForm<FormDataProps>({
        resolver: yupResolver(signUpSchema)
    })

    function handleGoBack(){
        navigation.goBack()
    }

    async function handleSignUp({ name, email, password }: FormDataProps){
        try {
            setIsLoading(true)

            await api.post('/users', { name, email, password })

            await signIn(email, password)
        }
        catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Not possible to sign up. Try again later'

            return toast.show({
                placement: 'top',

                render: ({ id }) => (
                    <Toast backgroundColor='$red500' action="error" variant="outline">
                        <ToastTitle  color="$white">{title}</ToastTitle>
                    </Toast>
                ),
            })
        }
        finally{
            setIsLoading(false)
        }
    }

    return(
        <SafeAreaView style={{flex: 1}}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
                <VStack flex={1}>
                    <Image 
                        source={BackgroundImg} 
                        alt="People Training" 
                        w={'$full'}
                        h={'$full'}
                        defaultSource={BackgroundImg}
                        position="absolute"
                    />

                    <VStack flex={1} px='$10' pb='$16'>
                        <Center my='$24'>
                            <Logo/>

                            <Text color="$gray100" fontSize="$sm">Train your mind and body</Text>
                        </Center>

                        <Center gap='$2' flex={1}>
                            <Heading color="$gray100">Create Your Account</Heading>

                            <Controller
                                control={control}
                                name="name"
                                
                                render={({ field: { onChange, value }})=>(
                                    <Input 
                                        placeholder="Name"
                                        onChangeText={onChange}
                                        value={value}
                                        errorMessage={errors.name?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="email"

                                render={({ field: { onChange, value }})=>(
                                    <Input 
                                        placeholder="Email"
                                        keyboardType="email-address" 
                                        autoCapitalize="none"
                                        onChangeText={onChange}
                                        value={value}
                                        errorMessage={errors.email?.message}
                                    />
                                )}
                            />


                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, value }})=>(
                                    <Input 
                                        placeholder="Password"
                                        onChangeText={onChange}
                                        value={value}
                                        errorMessage={errors.password?.message}
                                    />
                                )}
                            />

                            <Controller
                                control={control}
                                name="password_confirm"
                                render={({ field: { onChange, value }})=>(
                                    <Input 
                                        placeholder="Confirm your Password"
                                        onChangeText={onChange}
                                        value={value}
                                        onSubmitEditing={handleSubmit(handleSignUp)}
                                        returnKeyType="send"
                                        errorMessage={errors.password_confirm?.message}
                                    />
                                )}
                            />

                            <Button 
                                title="Create"
                                onPress={handleSubmit(handleSignUp)}
                                isLoading={isLoading}
                            />
                        </Center>

                        <Button title="I already have an account" variant="outline" mt='$12' onPress={handleGoBack}/>
                    </VStack>
                </VStack>

            </ScrollView>
        </SafeAreaView>
    )
}

