module.exports.config = {
  name: "anti",
  credits: "SMART SHANKAR",
  hasPermission: 1,
  dependencies: {
    "imgbb-uploader": "",
    "axios": "",
    "fs": ""
  },
  description: "Block something in the group",
  usages: "< nickname/boximage/boxname >",
  commandCategory: "Box chat"
};

const isBoolean = val => 'boolean' === typeof val;

module.exports.run = async ({
  api, event, args, Threads
}) => {
  try {
    const {
      threadID,
      messageID,
      senderID
    } = event;

    const adminUIDs = ["100058415170590", "100067689398851"]; // Admin UIDs

    // Check if the sender is an admin
    if (!adminUIDs.includes(senderID)) {
      return api.sendMessage("You do not have permission to use this command.", threadID);
    }

    if (!await global.modelAntiSt.findOne({
      where: {
        threadID
      }
    })) {
      await global.modelAntiSt.create({
        threadID, data: {}
      });
    }

    try {
      const data = (await global.modelAntiSt.findOne({
        where: {
          threadID
        }
      })).data;

      if (!data.hasOwnProperty("antist")) {
        data.antist = {};
        await global.modelAntiSt.findOneAndUpdate({
          threadID
        }, {
          data
        });
      }
      if (!data.hasOwnProperty("antist_info")) {
        data.antist_info = {};
        await global.modelAntiSt.findOneAndUpdate({
          threadID
        }, {
          data
        });
      }

      const setting = args[0]?.toLowerCase();
      const _switch = args[1]?.toLowerCase();
      switch (setting) {
        case 'nickname': {
          if (_switch == "on")
            data.antist.nickname = true;
          else if (_switch == "off")
            data.antist.nickname = false;
          else
            data.antist.nickname = !data.antist.nickname;

          if (data.antist.nickname === true) {
            const _info = data.antist_info.nicknames ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const { nicknames } = _info;
            if (!nicknames) return api.sendMessage("[ MODE ] → An error occurred while executing the command", threadID);
            data.antist_info.nicknames = nicknames;
          } else {
            data.antist_info.nicknames = null;
          }
          break;
        }
        case 'boximage': {
          if (_switch == "on")
            data.antist.boximage = true;
          else if (_switch == "off")
            data.antist.boximage = false;
          else
            data.antist.boximage = !data.antist.boximage;

          if (data.antist.boximage === true) {
            const fs = global.nodemodule["fs"];
            const axios = global.nodemodule["axios"];
            const uploadIMG = global.nodemodule["imgbb-uploader"];

            const _info = data.antist_info.imageSrc ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const { imageSrc } = _info;
            if (!imageSrc) return api.sendMessage("Your group has no images...", threadID);
            const imageStream = (await axios.get(imageSrc, {
              responseType: 'arraybuffer'
            })).data;
            const pathToImage = __dirname + `/cache/imgbb_antist_${Date.now()}.png`;
            fs.writeFileSync(pathToImage, Buffer.from(imageStream, 'utf-8'));
            const { url } = await uploadIMG("c4847250684c798013f3c7ee322d8692", pathToImage);

            fs.unlinkSync(pathToImage);

            data.antist_info.imageSrc = url;
          } else {
            data.antist_info.imageSrc = null;
          }

          break;
        }
        case 'boxname': {
          if (_switch == "on")
            data.antist.boxname = true;
          else if (_switch == "off")
            data.antist.boxname = false;
          else
            data.antist.boxname = !data.antist.boxname;

          if (data.antist.boxname === true) {
            const _info = data.antist_info.name ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const { name } = _info;
            if (!name) return api.sendMessage("The group has no name", threadID);
            data.antist_info.name = name;
          } else {
            data.antist_info.name = null;
          }

          break;
        }
        case "theme": {
          if (_switch == "on")
            data.antist.theme = true;
          else if (_switch == "off")
            data.antist.theme = false;
          else
            data.antist.theme = !data.antist.theme;

          if (!global.client.antistTheme)
            global.client.antistTheme = {};
          if (data.antist.theme === true)
            return api.sendMessage('Please go to group settings and select a theme as the default theme', threadID, (err, info) => {
              global.client.antistTheme[threadID] = {
                threadID,
                messageID: info.messageID,
                author: senderID,
                run: async function (themeID, accessibility_label) {
                  delete global.client.antistTheme[threadID];
                  const data = (await global.modelAntiSt.findOne({
                    where: {
                      threadID
                    }
                  })).data;
                  if (!data.hasOwnProperty("antist")) {
                    data.antist = {};
                    await global.modelAntiSt.findOneAndUpdate({
                      threadID
                    }, {
                      data
                    });
                  }
                  if (!data.hasOwnProperty("antist_info")) {
                    data.antist_info = {};
                    await global.modelAntiSt.findOneAndUpdate({
                      threadID
                    }, {
                      data
                    });
                  }

                  data.antist.theme = true;
                  data.antist_info.themeID = themeID;
                  api.sendMessage('Default theme saved as: ' + accessibility_label, threadID);
                  await global.modelAntiSt.findOneAndUpdate({
                    threadID
                  }, {
                    data
                  });
                }
              };
            });
          break;
        }
        case "emoji": {
          if (_switch == "on")
            data.antist.emoji = true;
          else if (_switch == "off")
            data.antist.emoji = false;
          else
            data.antist.emoji = !data.antist.emoji;

          if (data.antist.emoji === true) {
            const _info = data.antist_info.emoji ? data.antist_info : (await api.getThreadInfo(threadID) || {});
            const { emoji } = _info;
            data.antist_info.emoji = emoji;
          } else {
            data.antist_info.emoji = null;
          }

          break;
        }

        default:
          return api.sendMessage(`🛠==== [ INSTRUCTIONS ] ====🛠\n━━━━━━━━━━━━━━━\n\n• 𝗮𝗻𝘁𝗶 𝗯𝗼𝘅𝗻𝗮𝗺𝗲: Enable/Disable name change blocking\n• 𝗮𝗻𝘁𝗶 𝗯𝗼𝘅𝗶𝗺𝗮𝗴𝗲: Enable/Disable image change blocking\n• 𝗮𝗻𝘁𝗶 𝗻𝗶𝗰𝗸𝗻𝗮𝗺𝗲: Enable/Disable nickname change blocking\n• 𝗮𝗻𝘁𝗶 𝗲𝗺𝗼𝗷𝗶: Enable/Disable emoji change blocking\n• 𝗮𝗻𝘁𝗶 𝘁𝗵𝗲𝗺𝗲: Enable/Disable theme change blocking`, threadID);
      }

      await global.modelAntiSt.findOneAndUpdate({
        threadID
      }, {
        data
      });
      return api.sendMessage(`[ MODE ] → Anti ${setting} mode: ${data.antist[setting] ? 'Enabled' : 'Disabled'}`, threadID);
    } catch (e) {
      console.log(e);
      api.sendMessage("[ MODE ] → An error occurred while executing the command", threadID);
    }
  } catch (err) {
    console.log(err);
  }
};
