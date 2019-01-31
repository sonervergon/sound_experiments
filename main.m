clear; clc; warning off;

% Sound pressure data
% p_ref = 2*10^-5;
% Lp = 10*log(raw_data.^2/p_ref^2);

% Random microphone sounds from different devices.
mac = DataImporter('sounds_sound_mac.txt');
op = DataImporter('sounds_sound_oneplus.txt'); % One plus

% One plus high freq, seems like there are some kind of filter 
% opHF = DataImporter('sounds_sound_oneplusHF.txt'); 
% op15000 = DataImporter('sounds_sound_op_1500.txt'); 
% op6500 = DataImporter('sounds_sound_op_6500.txt'); 
% op10000 = DataImporter('sounds_sound_op_10000.txt');
opNoise = DataImporter('sounds_sound_op_noise.txt');
% opR = DataImporter('sounds_sound_karsten.txt'); 

% smsng = DataImporter('sounds_sound_erik.txt'); % Samsung

% Microphone sampling rate.
sampling_freq = 48000;

%% Play sound

soundsc(op10000, sampling_freq);
%%
sound(wgn(m,n,1))

%% Sound with frequencies in 500Hz and 20kHz
close all;
sound = opNoise;

subplot(2,1,1);
plot(sound)
subplot(2,1,2);
SingelSidedSpectraRMSplot(sound, length(sound), sampling_freq);
xlabel('Frequency [kHz]'); ylabel('Amp');

%% Sound with frequencies in 20kHz, 20.5kHz and 21kHz
close all;
S_HighFreq = DataImporter('sound_HighFreq.txt');
S_HighFreq2 = DataImporter('sound_HighFreq2.txt');
S_HighFreq2 = DataImporter('sounds_sound_erik.txt');
S_HighFreq2 = DataImporter('sounds_sound_olle.txt');
subplot(2,1,1);
plot(S_HighFreq)
subplot(2,1,2);
% [A, df] = SingelSidedSpectraRMSplot(S_HighFreq, length(S_HighFreq), sampling_freq);
% x_vec = (df:df:sampling_freq)./(2*10^2);
% plot(x_vec,A); xlabel('Frequency [kHz]'); ylabel('Amplitude')
% hold on;
[A, df] = SingelSidedSpectraRMSplot(S_HighFreq2, length(S_HighFreq2), sampling_freq);
x_vec2 = (df:df:sampling_freq)./(2*10^2); 
plot(x_vec2, A);xlabel('Frequency [kHz]'); ylabel('Amplitude')











