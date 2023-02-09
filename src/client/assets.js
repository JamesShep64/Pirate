const ASSET_NAMES = [
  'player.svg',
  'icon64.png',
  'icon1200.png',
  'page1.gif',
  'page2.png',
  'ex.gif',
  'page2.gif',
  'page3.gif',
  'page4.gif',
  'page5.gif',
  'page6.gif',
];

const assets = {};

const downloadPromise = Promise.all(ASSET_NAMES.map(downloadAsset));

function downloadAsset(assetName) {
  return new Promise(resolve => {
    const asset = new Image();
    asset.onload = () => {
      console.log(`Downloaded ${assetName}`);
      assets[assetName] = asset;
      resolve();
    };
    asset.src = `/assets/${assetName}`;
  });
}

export const downloadAssets = () => downloadPromise;

export const getAsset = assetName => assets[assetName];
