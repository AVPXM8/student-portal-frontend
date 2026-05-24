import React from 'react';
import Image from 'next/image';
import styles from './AwardCarousel.module.css';

const awardWinners = [
  { name: 'Unnati kushwaha', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714596/UNNATI_KUSHWAHA_pds1z8.jpg' },
  { name: 'Shreya Omer', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714595/SHREYA_OMER_odhwbx.jpg' },
  { name: 'Prateek Katiyar', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773715141/Prateek_katiyar_ax9vae.jpg' },
  { name: 'Ritika Majhi', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714594/RITIKA_MAJHI_hjxb0u.jpg' },
  { name: 'Richa Chaudhary', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714593/RICHA_CHAUDHARY_alh361.jpg' },
  { name: 'Priyanshu Bajpai', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714592/Priyanshu_bajpai_rilkr2.jpg' },
  { name: 'Pradeep Rajbhar', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714590/PRADEEP_RAJBHAR_zzuj57.jpg' },
  { name: 'Pankaj singh', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714589/PANKAJ_SINGH_pfm6t9.jpg' },
  { name: 'Nibha Yadav', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714588/NIBHA_YADAV_swvshx.jpg' },
  { name: 'Garima Tiwari', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714586/KASHISH_MISHRA_xbjptw.jpg' },
  { name: 'Kashish Gupta', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714584/KASHISH_GUPTA_howev8.jpg' },
  { name: 'Jigyasa Dosar', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714583/JIGYASA_NISHAD_nxq0bi.jpg' },
  { name: 'Harsh Dixit', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714582/Harsh_dixit_utt6wp.jpg' },
  { name: 'Divyajeet Singh', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714581/DIVYAJEET_SINGH_c78uvo.jpg' },
  { name: 'Dharamveer Singh', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714580/DHARAMVEER_SINGH_plpm8a.jpg' },
  { name: 'Deepak', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714578/DEEPAK_lbcxjb.jpg' },
  { name: 'Arshi anam', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714578/ARSHI_ANAM_nuczcd.jpg' },
  { name: 'Arpit Katiyar', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714576/ARPIT_KATIYAR_gmkznr.jpg' },
  { name: 'Unnati Mishra', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714576/UNNATI_MISHRA_nxwjyq.jpg' },
  { name: 'Abhishek kumar', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714576/ABHISHEK_KUMAR_njepru.jpg' },
  { name: 'Ankit Verma', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714576/ANKIT_VERMA_w22tbb.jpg' },
  { name: 'Vishal singh', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714574/VISHAL_SINGH_ozbalw.jpg' },
  { name: 'Ankit Singh', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714574/ANKIT_SINGH_bc7l7u.jpg' },
  { name: 'Vansh Kanaujiya', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714574/VANSH_KANAUJIYA_cmeod6.jpg' },
  { name: 'Varun Tiwari', imageUrl: 'https://res.cloudinary.com/dph6urjjf/image/upload/v1773714573/VARUN_TIWARI_lhwdwt.jpg' },
];

const allImages = [...awardWinners, ...awardWinners];

const AwardCarousel = () => {
  return (
    <div className={styles.scrollerContainer} style={{ '--item-count': allImages.length }}>
      <div className={styles.scroller}>
        {allImages.map((winner, index) => (
          <div className={styles.card} key={index}>
            <Image
              src={winner.imageUrl}
              alt={`Award winner ${winner.name}`}
              className={styles.cardImage}
              width={150}
              height={200}
              sizes="150px"
            />
            <div className={styles.cardOverlay}>
              <p className={styles.cardName}>{winner.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AwardCarousel;
