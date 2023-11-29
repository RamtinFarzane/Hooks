'use client';

import React, { useCallback, useRef, useState, useLayoutEffect, useEffect } from 'react';

// Next
import dynamic from 'next/dynamic';

// Next Router
import { useRouter } from 'next/navigation';

// Query
import { useHandleSubmitNationalId } from '@/store/server/features/kyc/uploadDocument/mutations';

// React Webcam
import Webcam, { WebcamProps } from 'react-webcam';

// Mui
import { Box, BoxProps, Stack, Typography, useTheme } from '@mui/material';

// Hooks
import { useCurrentDevicePermissions } from '@/hooks/devicePermissions';

// Utils
import { dataUrlToFile } from '@/utils/dataUrlToFile';

// Icons
import CheckOutline from '@/components/common/icon/components/checkOutline';
import ArrowsSynchronize from '@/components/common/icon/components/arrowsSynchronize';
import ImageCamera1 from '@/components/common/icon/components/imageCamera1';
import { Button } from '@/components/common/button';

// Components
const Level = dynamic(() => import('@/components/pages/kyc/level'));
const IconButton = dynamic(() =>
  import('@/components/common/iconButton').then((module) => module.IconButton)
);

// Types
type Props = BoxProps | WebcamProps;

// ---------------------------------------------|| CAPTURE - PAGES ||---------------------------------------------------

const Capture = () => {

  // F Hooks
  const permission = useCurrentDevicePermissions('camera');


  // Use Query
  const { mutate, isLoading } = useHandleSubmitNationalId();

  // Use Router
  const router = useRouter();

  // Use Theme
  const theme = useTheme();

  // Use Ref
  const webcamRef = useRef<Webcam>(null);

  // States
  const [frontNationalIdPicture, setFrontNationalIdPicture] = useState<
    string | null
  >();
  const [behindNationalIdPicture, setBehindNationalIdPicture] = useState<
    string | null
  >();

  const [permissionStatus, setPermissionStatus] = useState<string>('');

  // Styles
  const rootStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '15.6875rem',
    borderRadius: '0.5625rem',
    background: theme.palette.text.primary,
    boxShadow:
      '3px 3px 5px 0px rgba(0, 0, 0, 0.08), -3px -3px 6px 0px rgba(255, 255, 255, 0.40)',
  };

  // Methods
  const capture = useCallback(() => {
    const imageSrc = webcamRef?.current?.getScreenshot();

    if (imageSrc) {
      if (!frontNationalIdPicture) {
        setFrontNationalIdPicture(imageSrc);
      } else {
        setBehindNationalIdPicture(imageSrc);
      }
    }
  }, [webcamRef, frontNationalIdPicture, behindNationalIdPicture]);

  const handleSubmitNationalId = () => {
    const formData = new FormData();

    localStorage.setItem('nationalId', String(frontNationalIdPicture));
    localStorage.setItem('behindNationalId', String(behindNationalIdPicture));

    Promise.all([
      dataUrlToFile(frontNationalIdPicture!, 'NationalIdImage.png'),
      dataUrlToFile(behindNationalIdPicture!, 'NationalIdBehindImage.png'),
    ]).then((res) => {
      formData.append('NationalIdImage', res[0]);
      formData.append('NationalIdBehindImage', res[1]);

      mutate(formData, {
        onSuccess: () => {
          router.push('/kyc/documentVerification');
        },
      });
    });
  };

  const PermissionHandler = async () => {
    // navigator.permissions.query({name: 'camera'})
    // .then((permissionObj) => {
    //  console.log(permissionObj.state);
    // })
    // .catch((error) => {
    //  console.log('Got error :', error);
    // })
    // navigator.mediaDevices.watchPosition(function(position) {
    //   console.log("i'm tracking you!");
    // },
    // function(error) {
    //   if (error.code == error.PERMISSION_DENIED)
    //     console.log("you denied me :-(");
    // });
    // navigator.permissions.query({ name: 'camera' as PermissionName }).then((res) => {
    //   if (res.state === 'granted') {
    //     alert('inji');
    //   } else {
    //     console.log('Camera permission not granted');
    //   }
    // });
    navigator.mediaDevices.getUserMedia({video: true })
       .then(function (stream) {
       // Handle success (you can do something with the stream if needed)
         location.reload();
       })
       .catch((err: any) => console.log(err));
  };
  const doOperation = () => {
    if (frontNationalIdPicture && behindNationalIdPicture) {
      handleSubmitNationalId();
    } else capture();
  };

  //
  // useEffect(() => {
  //   const permissionName = "camera" as PermissionName;
  //   navigator.permissions
  //     .query({ name: permissionName })
  //     .then((permissionObj) => {
  //       if(permissionObj?.state === 'denied') {
  //         alert('inja')
  //       }
  //       // setPermissionStatus()
  //     })
  //     .catch((error) => {
  //       console.error('Permission Denied')
  //     });
  // }, []);

  // useEffect(() => {
  //   console.log('annnn', permission)
  // }, [permission])

  return (
    <Stack spacing={'1.62rem'}>
      <Stack direction='row' alignItems='center' minHeight={'1.625rem'}>
        <Level active={2} />
      </Stack>
      <Stack spacing={'0.5rem'}>
        <Stack direction='row' alignItems='center' minHeight={'3rem'}>
          <Typography variant='h5' color='primary' fontWeight='bold'>
            کارت شناسایی
          </Typography>
        </Stack>
        <Stack direction='row' alignItems='start' minHeight={'2.4375rem'}>
          <Typography variant='h6'>
            {frontNationalIdPicture
              ? 'پشت کارت شناسایی خود را مقابل دوربین قرار دهید'
              : 'کارت شناسایی خود را مقابل دوربین قرار دهید'}
          </Typography>
        </Stack>
        <Button variant='glass' onClick={PermissionHandler}>
          گرفتن دسترسی
        </Button>
      </Stack>

      {!behindNationalIdPicture && (
        <Box sx={{ ...rootStyle }}>
          <Webcam
            width='100%'
            height='100%'
            ref={webcamRef}
            mirrored
            imageSmoothing={true}
            screenshotFormat='image/png'
          />
        </Box>
      )}

      {behindNationalIdPicture && (
        <Box
          sx={{
            ...rootStyle,
            backgroundImage: `url(${behindNationalIdPicture})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        ></Box>
      )}

      <Stack
        direction='row'
        justifyContent='center'
        alignItems='center'
        spacing={'1.5rem'}
      >
        <Stack spacing='0.25rem'>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconButton
              disabled={isLoading}
              onClick={doOperation}
              size='large'
              variant={'rounded'}
              color={'secondary'}
            >
              {frontNationalIdPicture && behindNationalIdPicture ? (
                <CheckOutline />
              ) : (
                <ImageCamera1 />
              )}
            </IconButton>
          </Box>
          <Typography textAlign='center' variant='body1'>
            {frontNationalIdPicture && behindNationalIdPicture
              ? 'ارسال'
              : 'عکس برداری'}
          </Typography>
        </Stack>
        {frontNationalIdPicture && behindNationalIdPicture && (
          <Stack spacing='0.25rem'>
            <Box
              onClick={capture}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <IconButton
                disabled={isLoading}
                onClick={() => {
                  setFrontNationalIdPicture(null);
                  setBehindNationalIdPicture(null);
                }}
                size='large'
                variant={'glassRounded'}
                color={'secondary'}
              >
                <ArrowsSynchronize />
              </IconButton>
            </Box>
            <Typography textAlign='center' variant='body1'>
              عکس برداری مجدد
            </Typography>
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default Capture;
