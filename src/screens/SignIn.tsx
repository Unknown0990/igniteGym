import { VStack, Image, Center, Text, Heading, ScrollView, useToast, Toast, ToastTitle } from "@gluestack-ui/themed";
import { useNavigation } from "@react-navigation/native";

import BackgroundImg from '@assets/background.png'
import Logo from '@assets/logo.svg'

import { AuthNavigatorRoutesProps } from '@routes/auth.routes'

import Button from "@components/Button";
import { Input } from "@components/Input";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import { AppError } from "@utils/AppError";
import { useState } from "react";

type FormData = {
    email: string;
    password: string;
}

export function SignIn(){
    const [isLoading, setIsLoading] = useState(false)

    const navigation = useNavigation<AuthNavigatorRoutesProps>()

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>()

    const { signIn } = useAuth()

    const toast = useToast()

    function handleNewAccount(){
        navigation.navigate('signUp')
    }

    async function handleSignIn({ email, password }: FormData){
        try {
            setIsLoading(true)
            await signIn(email, password)
        }
        catch (error) {
            const isAppError = error instanceof AppError
            
            const title = isAppError ? error.message : 'Not possible to sign in. Try again later'

            setIsLoading(false)

            return toast.show({
                placement: 'top',

                render: ({ id }) => (
                    <Toast backgroundColor='$red500' action="error" variant="outline">
                        <ToastTitle  color="$white">{title}</ToastTitle>
                    </Toast>
                ),
            })
        }
    }

    return(
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

                    <Center gap='$2'>
                        <Heading color="$gray100">Access your account</Heading>

                        <Controller
                            control={control}
                            name='email'
                            rules={{ required: 'Inform your email'}}
                            render={({ field: { onChange } }) => (
                                <Input 
                                    placeholder="Email" 
                                    keyboardType="email-address" 
                                    autoCapitalize="none"
                                    onChangeText={ onChange }
                                    errorMessage={errors.email?.message}
                                />
                            )}
                        />


                        <Controller
                            control={control}
                            name='password'
                            rules={{ required: 'Inform your password'}}
                            render={({ field: { onChange } }) => (
                                <Input 
                                    placeholder="Password" 
                                    onChangeText={ onChange }
                                    errorMessage={errors.password?.message}
                                    secureTextEntry
                                />
                            )}
                        />

                        <Button 
                            title="Acessar" 
                            onPress={handleSubmit(handleSignIn)} 
                            isLoading={isLoading}
                        />
                    </Center>

                    <Center flex={1} justifyContent="flex-end" mt='$4'>
                        <Text color="$gray100" fontSize='$sm' mb='$3' fontFamily="$body">Still doesn't have access?</Text>

                        <Button title="Create Account" variant="outline" onPress={handleNewAccount}/>
                    </Center>
                </VStack>
            </VStack>

        </ScrollView>
    )
}