const {
    SlashCommandBuilder,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Client,
} = require("discord.js");
const fs = require("node:fs");
module.exports = {
    data: new SlashCommandBuilder().setName("blackjack").setDescription("Play blackjack! (21 點)"),
    /**
     *
     * @param {Client} client
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
    async execute(client, interaction) {
        const moreEmbed = new ButtonBuilder()
            .setCustomId("more")
            .setLabel("再要一張")
            .setStyle(ButtonStyle.Primary);

        const denyEmbed = new ButtonBuilder()
            .setCustomId("deny")
            .setLabel("不要了")
            .setStyle(ButtonStyle.Primary);

        const buttonRow = new ActionRowBuilder().addComponents(moreEmbed, denyEmbed);
        const collector = interaction.channel.createMessageComponentCollector({ time: 60000 });
        //topic : 產生52張牌並洗牌
        //subtopic : generate 52 cards
        const suits = ["♠", "♥", "♦", "♣"];
        let cards = new Array();
        suits.forEach((suits) => {
            for (let i = 1; i <= 13; i++) {
                switch (i) {
                    case 1:
                        cards.push(suits + "A");
                        break;
                    case 11:
                        cards.push(suits + "J");
                        break;
                    case 12:
                        cards.push(suits + "Q");
                        break;
                    case 13:
                        cards.push(suits + "K");
                        break;
                    default:
                        cards.push(suits + i);
                        break;
                }
            }
        });
        // subtopic : shuffle cards
        shuffleArray(cards);
        console.log(cards);

        //topic : 起始發牌
        let userCards = new Array();
        let computerCards = new Array();
        hitCard(cards, userCards, 2);
        hitCard(cards, computerCards, 2);

        //topic : 玩家補牌
        let ask = true;
        let userScore = 0;
        let userBomb = false;
        const askStr = ", 還要繼續要牌嗎？";
        collector.on("collect", async (collected) => {
            ask = collected.customId === "more";
            if (ask) {
                let allStr = "你現在有";
                userCards.forEach((card) => {
                    allStr += " " + card;
                });
                allStr += askStr;
                const buttonEmbed = new EmbedBuilder()
                    .setColor("#ffffff")
                    .setTitle(`決戰21點`)
                    .setDescription(allStr);
                // await interaction.editReply({ embeds: [buttonEmbed], components: [buttonRow] });
                const newCard = hitCard(cards, userCards);
                buttonEmbed.setDescription(`你抽到了 ${newCard}`);
                userScore = cardCalc(userCards);
                if (userScore > 21) {
                    userBomb = true;
                } else if (userScore === 21) {
                    await collected.reply({ embeds: [buttonEmbed] });
                } else {
                    await collected.reply({ embeds: [buttonEmbed], components: [buttonRow] });
                    return;
                }
            }

            //topic : 電腦補牌
            let computerScore = cardCalc(computerCards);
            while (computerScore < 17) {
                hitCard(cards, computerCards);
                computerScore = cardCalc(computerCards);
            }

            //topic : 判斷輸贏
            let buttonEmbed = new EmbedBuilder().setColor("#ffffff").setTitle(`決戰21點`);
            if (userBomb)
                embedReply(
                    `你爆牌了！ (${userCards.join(", ")})`,
                    buttonEmbed,
                    "#ff0000",
                    "https://media.giphy.com/media/xThtar1NqgCgl3uSmQ/giphy.gif",
                );
            else {
                if (computerScore > 21)
                    embedReply(
                        `電腦爆牌了！ (${computerCards.join(", ")})`,
                        buttonEmbed,
                        "#00ff00",
                        "https://media.giphy.com/media/iUtU5au1bfb5N7XGdh/giphy.gif",
                    );
                else {
                    if (userScore > computerScore)
                        embedReply(
                            `你贏了！ Computer :${computerCards.join(", ")}`,
                            buttonEmbed,
                            "#00ff00",
                            "https://media.giphy.com/media/2S9Hio4GAGUEZXxUg4/giphy.gif",
                        );
                    else if (userScore < computerScore)
                        embedReply(
                            `你輸了！ Computer :${computerCards.join(", ")}`,
                            buttonEmbed,
                            "ff0000",
                            "https://media.giphy.com/media/lwYxf0qKEjnoI/giphy-downsized-large.gif",
                        );
                    else embedReply(`平手！`, buttonEmbed, "#0000ff");
                }
            }
            async function embedReply(reply, Embed, color = "#ffffff", image = null) {
                Embed.setDescription(reply).setColor(color).setImage(image);
                if (collected.replied) {
                    await collected.followUp({ embeds: [Embed] });
                } else {
                    await collected.reply({ embeds: [Embed] });
                }
            }
            collector.stop();
        });
        let allStr = "你現在有";
        userCards.forEach((card) => {
            allStr += " " + card;
        });
        allStr += askStr;
        const buttonEmbed = new EmbedBuilder()
            .setColor("#5865F2")
            .setTitle(`決戰21點`)
            .setDescription(allStr);
        await interaction.reply({ embeds: [buttonEmbed], components: [buttonRow] });
    },
};
function cardCalc(cards) {
    let score = 0;
    cards.forEach((card) => {
        const unit = card.slice(1);
        switch (unit) {
            case "A":
                score += 1;
                break;
            case "J":
            case "Q":
            case "K":
                score += 10;
                break;
            default:
                score += Number.parseInt(unit);
                break;
        }
    });
    return score;
}
function hitCard(stack, cards, times = 1) {
    let card;
    for (let i = 0; i < times; i++) {
        card = stack.pop();
        cards.push(card);
    }
    return card;
}

function shuffleArray(array) {
    let currentIndex = array.length,
        temporaryValue,
        randomIndex;

    // While there remain elements to shuffle...
    while (1 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}
