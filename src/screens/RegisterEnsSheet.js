import React, { useState } from 'react';
import { format } from 'date-fns';
import { KeyboardArea } from 'react-native-keyboard-area';
import { useQuery } from 'react-query';
import dice from '../assets/dice.png';
import TintButton from '../components/buttons/TintButton';
import {
  SearchInput,
  SearchResultGradientIndicator,
} from '../components/ens-registration';
import {
  SheetActionButton,
  SheetActionButtonRow,
  SlackSheet,
} from '../components/sheet';
import {
  Box,
  Divider,
  Heading,
  Inline,
  Inset,
  Stack,
  Text,
} from '@rainbow-me/design-system';
import { fetchRegistration } from '@rainbow-me/handlers/ens';
import {
  useDebounceString,
  useDimensions,
  useKeyboardHeight,
} from '@rainbow-me/hooks';
import { ImgixImage } from '@rainbow-me/images';
import { colors } from '@rainbow-me/styles';
import { NativeModules } from 'react-native';

export default function RegisterEnsSheet() {
  const { height: deviceHeight } = useDimensions();
  const keyboardHeight = useKeyboardHeight();

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounceString(searchQuery);

  const { data: registration, status } = useQuery(
    debouncedSearchQuery.length > 2 && ['registration', debouncedSearchQuery],
    async (_, searchQuery) => {
      const fastFormatter = (timestamp, abbreviated = true) => {
        let style = abbreviated ? 'MMM d, y' : 'MMMM d, y';
        return format(new Date(Number(timestamp) * 1000), style);
      };
      const registration = await fetchRegistration(searchQuery + '.eth');
      return {
        expirationDate: fastFormatter(registration.expiryDate),
        isRegistered: registration.isRegistered,
        registrationDate: fastFormatter(registration.registrationDate, false),
      };
    }
  );
  const isLoading = status === 'loading';
  const isSuccess = registration && status === 'success';

  const state = useMemo(() => {
    if (isSuccess) {
      if (registration?.isRegistered) {
        return 'warning';
      }
      return 'success';
    }
    return undefined;
  }, [isSuccess, registration?.isRegistered]);

  return (
    <Box background="body" flexGrow={1}>
      <SlackSheet
        bottomInset={42}
        limitScrollViewContent
        {...(ios
          ? { height: '100%' }
          : { additionalTopPadding: true, contentHeight: deviceHeight })}
      >
        <Box flexGrow={1} paddingTop="30px">
          <Stack alignHorizontal="center" space="15px">
            <Heading size="23px" weight="heavy">
              􀠎 Find your name
            </Heading>
            <Text color="secondary50" size="18px" weight="bold">
              Search available profile names
            </Text>
          </Stack>

          <Box
            alignItems="center"
            paddingBottom="24px"
            paddingHorizontal="19px"
            paddingTop="42px"
          >
            <SearchInput
              isLoading={isLoading}
              onChangeText={setSearchQuery}
              placeholder="Input placeholder"
              state={state}
              value={searchQuery}
            />
          </Box>

          {isLoading && (
            <Text color="secondary40" size="18px" weight="bold">
              Hold a sec...
            </Text>
          )}
          {isSuccess && (
            <Inset horizontal="19px">
              <Stack
                separator={
                  <Inset horizontal="19px">
                    <Divider />
                  </Inset>
                }
                space="19px"
              >
                <Inline alignHorizontal="justify" wrap={false}>
                  <SearchResultGradientIndicator
                    isRegistered={registration.isRegistered}
                    type="availability"
                  />
                  {registration.isRegistered ? (
                    <SearchResultGradientIndicator
                      expirationDate={registration.expirationDate}
                      type="expiration"
                    />
                  ) : (
                    <SearchResultGradientIndicator
                      price="$5 / Year"
                      type="price"
                    />
                  )}
                </Inline>
                <Inset horizontal="19px">
                  {registration.isRegistered ? (
                    <Text color="secondary50" size="16px" weight="bold">
                      This name was last registered on{' '}
                      {registration.registrationDate}
                    </Text>
                  ) : (
                    <Inline>
                      <Text color="secondary50" size="16px" weight="bold">
                        Estimated total cost of
                        <Text color="secondary80" size="16px" weight="heavy">
                          {' $87.57 '}
                        </Text>
                        with current network fees
                      </Text>
                    </Inline>
                  )}
                </Inset>
              </Stack>
            </Inset>
          )}
        </Box>
        <Box paddingTop="42px">
          {debouncedSearchQuery.length < 3 && (
            <Inline
              alignHorizontal="center"
              alignVertical="center"
              space="6px"
              wrap={false}
            >
              <Box>
                <ImgixImage source={dice} style={{ height: 20, width: 20 }} />
              </Box>
              <Text color="secondary50" size="16px" weight="bold">
                Minimum 3 characters
              </Text>
            </Inline>
          )}
          <SheetActionButtonRow>
            {isSuccess && debouncedSearchQuery.length > 2 && (
              <>
                {registration.isRegistered ? (
                  <TintButton onPress={() => setSearchQuery('')}>
                    􀅉 Clear
                  </TintButton>
                ) : (
                  <SheetActionButton
                    color={colors.green}
                    label="Continue on 􀆊"
                    onPress={() => null}
                    size="big"
                    weight="heavy"
                  />
                )}
              </>
            )}
          </SheetActionButtonRow>
          <KeyboardArea initialHeight={keyboardHeight} isOpen />
        </Box>
      </SlackSheet>
    </Box>
  );
}
