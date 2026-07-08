/** Local, optimized photos in `public/images/site/` (see `scripts/optimize-site-images.mjs`). */
import { publicUrl } from "@/lib/publicPath";

export const SITE_IMAGES = {
  hero: publicUrl("/images/site/hero-los-angeles-twilight.jpg"),
  heroSuvAnaheim: publicUrl("/images/site/hero-suv-anaheim.jpg"),
  walkOfFameStar: publicUrl("/images/site/walk-of-fame-disney-star.jpg"),
  griffithSunsetAerial: publicUrl("/images/site/griffith-observatory-sunset-aerial.jpg"),
  beverlyHillsSign: publicUrl("/images/site/beverly-hills-sign.jpg"),
  santaMonicaPalms: publicUrl("/images/site/santa-monica-palms-sunset.jpg"),
  waltDisneyConcertHall: publicUrl("/images/site/walt-disney-concert-hall.jpg"),
  universalGlobe: publicUrl("/images/site/universal-studios-globe.jpg"),
  hollywoodSignHills: publicUrl("/images/site/hollywood-sign-hills.jpg"),
  griffithObservatoryDay: publicUrl("/images/site/griffith-observatory-day.jpg"),
  /** Tour originals — `temp_pics/update/` */
  cryptoComArenaExterior: publicUrl("/images/site/crypto-com-arena-exterior.jpg"),
  cryptoComArenaStarPlaza: publicUrl("/images/site/crypto-com-arena-star-plaza.jpg"),
  griffithObservatoryApproach: publicUrl("/images/site/griffith-observatory-approach.jpg"),
  tclChineseTheatre: publicUrl("/images/site/tcl-chinese-theatre-hollywood.jpg"),
  hardRockHollywood: publicUrl("/images/site/hard-rock-cafe-hollywood.jpg"),
  hollywoodLaLaLandTerminator: publicUrl("/images/site/hollywood-la-la-land-terminator.jpg"),
  classicHollywoodElvisCadillac: publicUrl("/images/site/classic-hollywood-elvis-cadillac.jpg"),
  theGroveVintageTruck: publicUrl("/images/site/the-grove-vintage-truck.jpg"),
  walkOfFameOliverStone: publicUrl("/images/site/walk-of-fame-oliver-stone-star.jpg"),
  santaMonicaYachtHarborSign: publicUrl("/images/site/santa-monica-yacht-harbor-sign.jpg"),
  /** Car-seat showcase — placeholder photos from Pexels/Unsplash (commercial use OK).
      Replace with photos of TNT's actual seats when available. */
  carSeatInfant: publicUrl("/images/site/car-seats/infant-seat.jpg"),
  carSeatBooster: publicUrl("/images/site/car-seats/child-booster.jpg"),
  carSeatProduct: publicUrl("/images/site/car-seats/seat-product.jpg"),
  carSeatParentInstalling: publicUrl("/images/site/car-seats/parent-installing.jpg"),
  blackSedan: publicUrl("/images/vehicle-sedan.webp"),
  blackSuv: publicUrl("/images/vehicle-suv.webp"),
  blackVan: publicUrl("/images/vehicle-van.webp"),
  blackSprinter: publicUrl("/images/vehicle-sprinter.webp"),
} as const;
