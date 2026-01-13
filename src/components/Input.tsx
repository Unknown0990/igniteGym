import { Input as GluestackInput, InputField, FormControl, FormControlErrorText, FormControlError } from '@gluestack-ui/themed'
import { ComponentProps } from 'react'

type Props = ComponentProps<typeof InputField> & {
    errorMessage?: string | null;
    isInvalid?: boolean;
    isDisabled?: boolean;
}

export function Input({isDisabled = false, errorMessage = null, isInvalid = false, ...rest }: Props){
    const invalid = !!errorMessage || isInvalid

    return(
        <FormControl isInvalid={invalid} w='$full' mb='$4'>
            <GluestackInput 
                h='$14' 
                borderWidth='$0' 
                borderRadius='$md' 
                $focus={{
                    borderWidth: 1,
                    borderColor: invalid ? '$red500' :'$green500',
                }}
                $invalid={{
                    borderWidth: 1,
                    borderColor: '$red500'
                }}
                isDisabled={isDisabled}
                opacity={isDisabled ? 0.5 : 1}
            >
                <InputField 
                    px='$4' 
                    bg='$gray700' 
                    color='$white' 
                    fontFamily='$body' 
                    placeholderTextColor='$gray300'
                    {...rest} 
                />
            </GluestackInput>  

            <FormControlError>
                <FormControlErrorText 
                    color='$red500'
                >
                    {errorMessage}
                </FormControlErrorText>
            </FormControlError>
        </FormControl>
    )
}