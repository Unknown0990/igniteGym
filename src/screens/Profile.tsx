import { Center, Heading, Text, VStack, onChange, useToast } from "@gluestack-ui/themed";

import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

import { ScreenHeader } from "@components/ScreenHeader";
import { ScrollView, TouchableOpacity } from "react-native";
import { UserPhoto } from "@components/UserPhoto";
import { Input } from "@components/Input";
import Button from "@components/Button";
import { useState } from "react";
import { ToastMessage } from "@components/ToastMessage";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@hooks/useAuth";
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "@services/api";
import { AppError } from "@utils/AppError";
import { isLoaded } from "expo-font";
import mime from 'mime'
import defaultUserImage from '@assets/userPhotoDefault.png'

type FormProps = {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirmation: string;
}

const profileSchema = yup.object({
    name: yup.string().required('Inform your name'),
    
    password: yup.string().min(6, 'Must be 6-digit password').nullable().transform((value) => !!value ? value : null),

    password_confirmation: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password'), null], 'Password confirmation doesnt match')
    .when('password', {
        is: (Field: any) => Field,
        then: (schema: any) => schema
            .nullable()
            .required('Inform the password confirmation')
            .transform((value: any) => !!value ? value : null)
    })
})

export function Profile(){
    const [loading, setLoading] = useState(false)

    const toast = useToast()

    const { user, updateUserProfile } = useAuth()
    const { control, handleSubmit, formState: { errors } } = useForm<FormProps>({
        defaultValues: {
            name: user.name,
            email: user.email
        },
        resolver: yupResolver(profileSchema)
    })

    async function handleUserPhoto(){
        setLoading(true)
        
        try {
            const selectedPhoto = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                quality: 1,
                aspect: [4, 4],
                allowsEditing: true
            })

            if(selectedPhoto.canceled) return
    
            const photoURI = selectedPhoto.assets[0].uri
    
            if(photoURI){
                const file = new FileSystem.File(photoURI)
                const photoInfo = await file.info() as { size: number }

                // const photoInfo = (await FileSystem.getInfoAsync(photoURI)) as { size: number }

                if(photoInfo.size && (photoInfo.size / 1024 / 1024) > 5){
                    return toast.show({
                        placement: 'top',
    
                        render: ({ id }) => (
                            <ToastMessage
                                id={id} 
                                action="error"
                                title="This image is too big. " 
                                description="Pick another one that's smaller" 
                                onClose={
                                    ()=> toast.close(id)
                                }
                            />
                        ),
                    })
                }

                const fileExtension = photoURI.split('.')[photoURI.split('.').length - 1]

                const photoFile = {
                    name: `${user.name}.${fileExtension}`.toLowerCase(),
                    uri: photoURI,
                    type: `${selectedPhoto.assets[0].type}/${fileExtension}`
                } as any


                const userUploadForm = new FormData()

                userUploadForm.append('avatar', photoFile)

                const avatarLocation = await api.patch('/users/avatar', userUploadForm, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                })

                const updatedUser = user;
                updatedUser.avatar = avatarLocation.data.avatar
                updateUserProfile(updatedUser)
 
                return toast.show({
                    placement: 'top',
                    render: ({id})=>(
                        <ToastMessage
                            id={id}
                            action='success'
                            title='Photo updated!'
                            onClose={()=> toast.close(id)}
                        />
                    )
                })
            }
        }
        catch(error){
                return toast.show({
                    placement: 'top',
                    render: ({id})=>(
                        <ToastMessage
                            id={id}
                            action='error'
                            title={`Failed to Update: ${error}`}
                            onClose={()=> toast.close(id)}
                        />
                    )
                })
        }
        finally{
            setLoading(false)
        }
    }

    async function handleProfileUpdate(data: FormData){
        try {
            setLoading(true)
            const updatedUser = user;
            updatedUser.name = data.name;

            await api.put('/users', data)
            
            await updateUserProfile(updatedUser)

            return toast.show({
                placement: 'top',
                render: ({id})=>(
                    <ToastMessage
                        id={id}
                        action='success'
                        title='Updated Successfully'
                        onClose={()=> toast.close(id)}
                    />
                )
            })
        }
        catch (error) {
            const isAppError = error instanceof AppError
            const title = isAppError ? error.message : 'Not possible to update'

            return toast.show({
                placement: 'top',
                render: ({id})=>(
                    <ToastMessage
                        id={id}
                        action='error'
                        title={title}
                        onClose={()=> toast.close(id)}
                    />
                )
            })
        }
        finally{
            setLoading(false)
        }
    }
        
    return(
        <VStack flex={1}>
            <ScreenHeader title="Perfil"/>

            <ScrollView contentContainerStyle={{ paddingBottom: 36 }}>
                <Center mt='$6' px='$10'>
                    <UserPhoto 
                        source={{ uri: `${api.defaults.baseURL}/avatar/${user?.avatar}`}} 
                        alt="User photo"
                        size='xl'
                    />

                    <TouchableOpacity onPress={handleUserPhoto}>
                        <Text color='$green500' fontFamily="$heading" fontSize='$md' mt='$2' mb='$8'>Change Profile Picture</Text>
                    </TouchableOpacity>

                    <Controller
                        control={control}
                        name='name'
                        render={({field: {onChange, value}}) => (
                            <Input 
                                placeholder="Name" 
                                bg="$gray600"
                                onChangeText={onChange}
                                value={value}
                                errorMessage={errors?.name?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='email'
                        render={({field: {onChange, value}}) => (
                            <Input 
                                value={value}
                                bg="$gray600" 
                                isDisabled
                                onChangeText={onChange}
                                placeholder="Email"
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='old_password'
                        render={({field: { onChange }}) => (
                            <Input 
                                placeholder="Previous Password" 
                                bg="$gray600" 
                                secureTextEntry
                                onChangeText={onChange}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password'
                        render={({field: { onChange }}) => (
                            <Input 
                                placeholder="New Password" 
                                bg="$gray600" 
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors?.password?.message}
                            />
                        )}
                    />

                    <Controller
                        control={control}
                        name='password_confirmation'
                        render={({field: { onChange }}) => (
                            <Input 
                                placeholder="Confirm New Password
                                " bg="$gray600" 
                                secureTextEntry
                                onChangeText={onChange}
                                errorMessage={errors?.password_confirmation?.message}
                            />
                        )}
                    />



                    <Heading alignSelf="flex-start" fontFamily="heading" color="$gray200" fontSize='$md' mt='$12' mb='$2'>
                        Change Password
                    </Heading>

                    <Button 
                        title='Save Changes'
                        mt={4}
                        onPress={handleSubmit(handleProfileUpdate)}
                        isLoading={loading}
                    />
                </Center>
            </ScrollView>
        </VStack>
    )
}