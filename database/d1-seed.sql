-- Arena Network — D1 Seed Data
-- 124 arenas, 48 events, 24 vendors, 16 sponsors, 3 users, 12 news

-- ============================================================
-- ARENA NETWORK — Full Demo Population
-- 124 Arenas · 48 Events · 24 Vendors · 16 Sponsors · 12 News
-- ============================================================
-- Usage: psql -d arena_network -f seed-full.sql
-- ============================================================

-- Clear everything in dependency order

-- ════════════════════════════════════════════════════════════
-- ARENAS (124)
-- ════════════════════════════════════════════════════════════

INSERT INTO arenas (name, slug, city, state, address, website, arena_type, indoor_arenas, outdoor_arenas, stall_count, rv_spaces, seating_capacity, is_verified, is_active) VALUES
-- ARIZONA
('WestWorld of Scottsdale','westworld-scottsdale','Scottsdale','AZ','16601 N Pima Rd, Scottsdale, AZ 85260','https://www.scottsdaleaz.gov/westworld','equine',4,6,2200,800,8000,1,1),
('Horseshoe Park & Equestrian Centre','horseshoe-park','Queen Creek','AZ','20464 E Riggs Rd, Queen Creek, AZ 85142','https://www.horseshoepark.com','equine',2,3,500,250,3000,1,1),
('Buckeye Equestrian Center','buckeye-equestrian','Buckeye','AZ','799 N Miller Rd, Buckeye, AZ 85326',NULL,'equine',1,3,400,200,2500,1,1),
('Rancho Rio Arena','rancho-rio','Wickenburg','AZ','37505 S Rancho Rio Dr, Wickenburg, AZ 85390',NULL,'equine',1,2,300,150,1500,1,1),
('Pima County Fairgrounds','pima-county-fairgrounds','Tucson','AZ','11300 S Houghton Rd, Tucson, AZ 85747','https://www.pimafair.com','fairgrounds',2,3,400,300,5000,1,1),
('Tim''s Toyota Center','tims-toyota-center','Prescott Valley','AZ','3201 N Main St, Prescott Valley, AZ 86314','https://www.timstoyotacenter.com','multi-use',1,1,100,100,6200,1,1),
('Arizona State Fairgrounds','arizona-state-fairgrounds','Phoenix','AZ','1826 W McDowell Rd, Phoenix, AZ 85007','https://azstatefair.com','fairgrounds',3,4,800,400,8000,1,1),
('Santa Cruz County Fairgrounds','santa-cruz-county-fair-az','Sonoita','AZ','3142 S Highway 83, Sonoita, AZ 85637','https://www.sonoitafairgrounds.com','fairgrounds',0,2,200,150,3000,1,1),
-- TEXAS
('Will Rogers Memorial Center','will-rogers','Fort Worth','TX','3401 W Lancaster Ave, Fort Worth, TX 76107','https://www.fortworthtexas.gov/departments/public-events/will-rogers','multi-use',5,3,3000,600,10000,1,1),
('Bell County Expo Center','bell-county-expo','Belton','TX','301 W Loop 121, Belton, TX 76513','https://www.bellcountyexpo.com','agricultural',3,2,800,400,6500,1,1),
('Fort Worth Stockyards','fort-worth-stockyards','Fort Worth','TX','131 E Exchange Ave, Fort Worth, TX 76164','https://www.fortworthstockyards.org','rodeo',1,1,200,100,4000,1,1),
('NRG Center & NRG Arena','nrg-center-houston','Houston','TX','1 NRG Park, Houston, TX 77054','https://www.nrgpark.com','multi-use',2,2,2500,500,70000,1,1),
('Amarillo National Center','amarillo-national-center','Amarillo','TX','3301 SE 10th Ave, Amarillo, TX 79104','https://www.tristatefairgrounds.com','multi-use',2,2,600,300,5000,1,1),
('Taylor County Expo Center','taylor-county-expo','Abilene','TX','1700 TX-36, Abilene, TX 79602','https://www.taylorcountyexpocenter.com','agricultural',2,2,500,250,5500,1,1),
('Mesquite Arena','mesquite-arena','Mesquite','TX','1818 Rodeo Dr, Mesquite, TX 75149','https://www.mesquitearena.com','rodeo',1,1,200,100,5500,1,1),
('Horseshoe Arena','horseshoe-arena-midland','Midland','TX','2514 Arena Trail, Midland, TX 79701','https://www.horseshoearena.com','equine',1,1,300,200,5000,1,1),
('Great Southwest Equestrian Center','great-southwest-equestrian','Katy','TX','2501 S Mason Rd, Katy, TX 77450','https://www.gswec.com','equine',2,3,800,200,3000,1,1),
('Texas Rose Horse Park','texas-rose-horse-park','Tyler','TX','14078 State Hwy 110 N, Tyler, TX 75704','https://www.texasrosehorsepark.com','equine',1,3,350,200,2000,1,1),
('Star of Texas Fair & Rodeo','star-of-texas','Austin','TX','9100 Decker Lake Rd, Austin, TX 78724','https://www.rodeoaustin.com','rodeo',1,2,400,300,7500,1,1),
('Extraco Events Center','extraco-events-center','Waco','TX','4601 Bosque Blvd, Waco, TX 76710','https://www.extracoeventscenter.com','multi-use',2,2,600,300,6200,1,1),
('Circle T Arena','circle-t-arena','Hamilton','TX','4007 W Hwy 36, Hamilton, TX 76531','https://www.circletarena.com','equine',1,2,300,100,2000,1,1),
('Hopkins County Civic Center','hopkins-county-civic','Sulphur Springs','TX','1200 Houston St, Sulphur Springs, TX 75482','https://www.hopkinscountytx.org','multi-use',1,1,250,150,3500,1,1),
('Mallet Event Center','mallet-event-center','Levelland','TX','2312 US-385, Levelland, TX 79336',NULL,'multi-use',1,1,200,100,2000,1,1),
('South Plains Fairgrounds','south-plains-fairgrounds','Lubbock','TX','105 E Broadway, Lubbock, TX 79403','https://www.southplainsfair.com','fairgrounds',2,2,500,300,5000,1,1),
-- OKLAHOMA
('Lazy E Arena','lazy-e','Guthrie','OK','7201 E Hwy 66, Guthrie, OK 73044','https://www.lazye.com','equine',1,2,600,350,5800,1,1),
('Oklahoma State Fair Park','okc-state-fair','Oklahoma City','OK','3001 General Pershing Blvd, Oklahoma City, OK 73107','https://okstatefair.com','agricultural',3,4,2000,700,12000,1,1),
('Tulsa Expo Square','tulsa-expo','Tulsa','OK','4145 E 21st St, Tulsa, OK 74114','https://www.exposquare.com','multi-use',4,3,1800,500,9200,1,1),
('Great Plains Coliseum','great-plains-coliseum','Lawton','OK','920 SW Sheridan Rd, Lawton, OK 73505',NULL,'multi-use',1,1,250,100,2500,1,1),
('Hardy Murphy Coliseum','hardy-murphy-coliseum','Ardmore','OK','3200 W Broadway St, Ardmore, OK 73401',NULL,'equine',1,1,400,200,3000,1,1),
('Jim Norick Arena','jim-norick-arena','Oklahoma City','OK','3001 General Pershing Blvd, Oklahoma City, OK 73107','https://okstatefair.com','equine',1,1,500,200,8800,1,1),
('Stephens County Expo Center','stephens-county-expo','Duncan','OK','2002 S 13th St, Duncan, OK 73533',NULL,'agricultural',1,1,200,100,2000,1,1),
('Claremore Expo Center','claremore-expo','Claremore','OK','400 S Veterans Pkwy, Claremore, OK 74017','https://www.claremoreexpo.com','multi-use',1,2,300,150,3000,1,1),
('Kay County Fairgrounds','kay-county-fairgrounds','Blackwell','OK','600 N Main St, Blackwell, OK 74631',NULL,'fairgrounds',1,2,200,100,2500,1,1),
('Creek County Fairgrounds','creek-county-fairgrounds','Kellyville','OK','17806 W Hwy 66, Kellyville, OK 74039',NULL,'fairgrounds',0,2,150,100,2000,1,1),
-- NEVADA
('South Point Arena & Equestrian Center','south-point','Las Vegas','NV','9777 Las Vegas Blvd S, Las Vegas, NV 89183','https://www.southpointcasino.com/amenities/equestrian-center','multi-use',2,1,1200,500,4600,1,1),
('Reno-Sparks Livestock Events Center','reno-sparks-livestock','Reno','NV','1350 N Wells Ave, Reno, NV 89512','https://www.renolivestock.com','multi-use',2,2,800,400,5500,1,1),
('Winnemucca Events Complex','winnemucca-events','Winnemucca','NV','3825 Potato Rd, Winnemucca, NV 89445','https://www.winnemuccaevents.com','multi-use',1,2,300,200,3000,1,1),
('Churchill County Fairgrounds','churchill-county-fair','Fallon','NV','325 Sheckler Rd, Fallon, NV 89406','https://www.churchillcountyfair.com','fairgrounds',1,2,200,150,2500,1,1),
-- CALIFORNIA
('Del Mar Fairgrounds','del-mar-fairgrounds','Del Mar','CA','2260 Jimmy Durante Blvd, Del Mar, CA 92014','https://www.delmarfairgrounds.com','fairgrounds',2,4,1000,300,5000,1,1),
('Paso Robles Horse Park','paso-robles-horse-park','Paso Robles','CA','3801 Hughes Pkwy, Paso Robles, CA 93446','https://www.pasorobleshorsepark.com','equine',1,4,600,200,2000,1,1),
('Los Angeles Equestrian Center','la-equestrian-center','Burbank','CA','480 Riverside Dr, Burbank, CA 91506','https://www.la-equestriancenter.com','equine',2,4,500,100,1500,1,1),
('Brookside Equestrian Park','brookside-equestrian','Elk Grove','CA','11120 Bradley Ranch Rd, Elk Grove, CA 95624','https://www.brooksideequestrianpark.com','equine',1,3,400,150,1500,1,1),
('Salinas Sports Complex','salinas-sports-complex','Salinas','CA','1034 N Main St, Salinas, CA 93906','https://www.salinassportscomplex.com','multi-use',1,2,300,200,3000,1,1),
('Earl Warren Showgrounds','earl-warren-showgrounds','Santa Barbara','CA','3400 Calle Real, Santa Barbara, CA 93105','https://www.earlwarren.com','fairgrounds',1,3,300,150,3000,1,1),
('Cal Expo','cal-expo','Sacramento','CA','1600 Exposition Blvd, Sacramento, CA 95815','https://www.calexpo.com','fairgrounds',2,3,800,400,8000,1,1),
('Yucaipa Equestrian Center','yucaipa-equestrian','Yucaipa','CA','13273 California St, Yucaipa, CA 92399',NULL,'equine',1,2,200,100,1000,1,1),
-- COLORADO
('National Western Complex','national-western-complex','Denver','CO','4655 Humboldt St, Denver, CO 80216','https://www.nationalwestern.com','multi-use',3,2,1500,400,10000,1,1),
('Colorado State Fair','colorado-state-fair','Pueblo','CO','1001 Beulah Ave, Pueblo, CO 81004','https://www.coloradostatefair.com','fairgrounds',2,3,800,400,6000,1,1),
('Douglas County Fairgrounds','douglas-county-fair','Castle Rock','CO','500 Fairgrounds Rd, Castle Rock, CO 80104','https://www.douglascountyfairgrounds.com','fairgrounds',1,2,300,200,3000,1,1),
('Colorado Horse Park','colorado-horse-park','Parker','CO','7522 S Pinery Dr, Parker, CO 80134','https://www.coloradohorsepark.com','equine',2,4,700,200,3000,1,1),
('Mesa County Fairgrounds','mesa-county-fair','Grand Junction','CO','2785 US-50, Grand Junction, CO 81503','https://www.mesacountyfair.com','fairgrounds',1,2,400,200,4000,1,1),
('Eagle County Fairgrounds','eagle-county-fair','Eagle','CO','550 Broadway St, Eagle, CO 81631','https://www.eaglecounty.us','fairgrounds',1,2,200,100,2000,1,1),
-- WYOMING
('Cheyenne Frontier Days','cheyenne-frontier-days','Cheyenne','WY','4610 Carey Ave, Cheyenne, WY 82001','https://www.cfdrodeo.com','rodeo',2,3,1000,500,19000,1,1),
('Casper Events Center','casper-events-center','Casper','WY','1 Events Dr, Casper, WY 82601','https://www.casperevents.com','multi-use',1,1,300,200,8000,1,1),
('Cam-Plex','cam-plex','Gillette','WY','1635 Reata Dr, Gillette, WY 82718','https://www.cam-plex.com','multi-use',2,2,400,300,5000,1,1),
('Park County Fairgrounds','park-county-fair-wy','Powell','WY','655 E 5th St, Powell, WY 82435','https://www.parkcountyfair.com','fairgrounds',1,2,300,150,3000,1,1),
-- MONTANA
('MetraPark','metrapark','Billings','MT','308 6th Ave N, Billings, MT 59101','https://www.metrapark.com','multi-use',2,2,600,300,10000,1,1),
('Montana ExpoPark','montana-expopark','Great Falls','MT','400 3rd St NW, Great Falls, MT 59404','https://www.montanaexpopark.com','fairgrounds',2,2,500,250,6000,1,1),
('Warfield Equestrian Park','warfield-equestrian','Billings','MT','3651 Alkali Creek Rd, Billings, MT 59105',NULL,'equine',1,3,400,200,2000,1,1),
-- SOUTH DAKOTA / NORTH DAKOTA
('Central States Fairgrounds','central-states-fair','Rapid City','SD','800 San Francisco St, Rapid City, SD 57701','https://www.centralstatesfair.com','fairgrounds',2,2,450,250,6000,1,1),
('W.H. Lyon Fairgrounds','wh-lyon-fairgrounds','Sioux Falls','SD','100 N Lyon Blvd, Sioux Falls, SD 57107','https://www.siouxempirefair.com','fairgrounds',2,2,400,200,4000,1,1),
('Red River Valley Fairgrounds','red-river-valley-fair','Fargo','ND','1805 Main Ave W, Fargo, ND 58078','https://www.redrivervalleyfair.com','fairgrounds',2,2,400,200,5000,1,1),
('North Dakota State Fair','nd-state-fair','Minot','ND','2005 Burdick Expy E, Minot, ND 58701','https://www.ndstatefair.com','fairgrounds',2,3,500,300,6000,1,1),
-- NEBRASKA / KANSAS
('Lancaster Event Center','lancaster-event-center','Lincoln','NE','4100 N 84th St, Lincoln, NE 68507','https://www.lancastereventcenter.org','multi-use',3,2,800,300,5000,1,1),
('Fonner Park','fonner-park','Grand Island','NE','700 E Stolley Park Rd, Grand Island, NE 68801','https://www.fonnerpark.com','multi-use',2,2,500,250,5000,1,1),
('Kansas State Fairgrounds','kansas-state-fair','Hutchinson','KS','2000 N Poplar St, Hutchinson, KS 67502','https://www.kansasstatefair.com','fairgrounds',2,3,600,300,6000,1,1),
('Kansas Expocentre','kansas-expocentre','Topeka','KS','1 Expocentre Dr, Topeka, KS 66612','https://www.ksexpo.com','multi-use',2,1,400,200,8000,1,1),
('Wichita Coliseum','wichita-coliseum','Wichita','KS','1229 E 85th St N, Valley Center, KS 67147',NULL,'multi-use',1,2,300,200,3000,1,1),
-- NEW MEXICO
('Expo New Mexico','expo-new-mexico','Albuquerque','NM','300 San Pedro Dr NE, Albuquerque, NM 87108','https://www.exponm.com','fairgrounds',3,3,800,400,7000,1,1),
('Curry County Events Center','curry-county-events','Clovis','NM','700 Main St, Clovis, NM 88101','https://www.currycountyevents.com','multi-use',1,1,300,200,3000,1,1),
('San Juan County Fairgrounds','san-juan-county-fair','Farmington','NM','901 Fairgrounds Rd, Farmington, NM 87401',NULL,'fairgrounds',1,2,250,150,3000,1,1),
-- UTAH
('Salt Lake County Equestrian Park','slc-equestrian-park','South Jordan','UT','2100 W 11400 S, South Jordan, UT 84095','https://www.slco.org/equestrian','equine',1,3,500,200,3000,1,1),
('Pegasus Event Center','pegasus-event-center','Grantsville','UT','291 Race St, Grantsville, UT 84029',NULL,'equine',1,2,300,150,2000,1,1),
('Cross Hollow Event Center','cross-hollow-event','Cedar City','UT','11 N Cross Hollow Dr, Cedar City, UT 84720',NULL,'multi-use',1,2,200,150,2500,1,1),
('Days of 47 Arena','days-of-47-arena','Salt Lake City','UT','155 N 1000 W, Salt Lake City, UT 84116',NULL,'rodeo',1,1,200,100,5000,1,1),
-- KENTUCKY / TENNESSEE
('Kentucky Horse Park','kentucky-horse-park','Lexington','KY','4089 Iron Works Pkwy, Lexington, KY 40511','https://www.kyhorsepark.com','equine',3,5,1200,400,7000,1,1),
('Louisville Equestrian Center','louisville-equestrian','Louisville','KY','4400 Billtown Rd, Louisville, KY 40299',NULL,'equine',2,2,200,50,1000,1,1),
('Kentucky Exposition Center','ky-exposition-center','Louisville','KY','937 Phillips Ln, Louisville, KY 40209','https://www.kyvenues.com','multi-use',3,2,1500,400,12000,1,1),
('Williamson County Ag Expo Park','williamson-county-expo','Franklin','TN','4215 Long Ln, Franklin, TN 37064','https://www.wcparksandrec.com','agricultural',2,3,400,200,3000,1,1),
('Tennessee Miller Coliseum','tn-miller-coliseum','Murfreesboro','TN','715 Champion Way, Murfreesboro, TN 37132',NULL,'equine',1,2,600,200,4000,1,1),
-- NORTH CAROLINA / SOUTH CAROLINA
('Tryon International Equestrian Center','tryon-equestrian','Mill Spring','NC','4066 Pea Ridge Rd, Mill Spring, NC 28756','https://www.tryon.com','equine',3,6,1000,500,6000,1,1),
('Gov. Hunt Horse Complex','hunt-horse-complex','Raleigh','NC','1025 Blue Ridge Blvd, Raleigh, NC 27607','https://www.ncstatefair.org','equine',2,4,700,300,4000,1,1),
('WNC Agricultural Center','wnc-ag-center','Fletcher','NC','761 Boylston Hwy, Fletcher, NC 28732','https://www.wncagcenter.org','agricultural',2,3,500,200,3000,1,1),
('T. Ed Garrison Livestock Arena','garrison-livestock','Pendleton','SC','1101 W Queen St, Pendleton, SC 29670','https://www.clemson.edu/public/garrison','agricultural',1,2,300,150,3000,1,1),
('Aiken Horse Park','aiken-horse-park','Aiken','SC','930 Powderhouse Rd, Aiken, SC 29803','https://www.aikentriplecrownfoundation.org','equine',0,6,624,200,3000,1,1),
-- GEORGIA / ALABAMA
('Georgia International Horse Park','georgia-horse-park','Conyers','GA','1996 Centennial Olympic Pkwy, Conyers, GA 30013','https://www.georgiahorsepark.com','equine',2,4,600,300,4000,1,1),
('Georgia National Fairgrounds','georgia-national-fair','Perry','GA','401 Larry Walker Pkwy, Perry, GA 31069','https://www.gnfa.com','fairgrounds',3,4,1200,500,8000,1,1),
('Full Circle Horse Park','full-circle-horse-park','Pell City','AL','5555 Wolf Creek Rd, Pell City, AL 35128',NULL,'equine',1,3,400,200,2500,1,1),
('Celebration Rodeo Arena','celebration-arena','Decatur','AL','1000 Point Mallard Dr, Decatur, AL 35601',NULL,'rodeo',1,1,200,100,5000,1,1),
-- FLORIDA
('Bob Thomas Equestrian Center','bob-thomas-equestrian','Tampa','FL','4800 US-301, Tampa, FL 33610','https://floridastatefair.com/equestrian','equine',1,5,471,200,3000,1,1),
('Florida Horse Park','florida-horse-park','Ocala','FL','11008 S Highway 475, Ocala, FL 34480','https://www.flhorsepark.com','equine',1,4,500,300,3000,1,1),
('Jacksonville Equestrian Center','jacksonville-equestrian','Jacksonville','FL','13611 Normandy Blvd, Jacksonville, FL 32221','https://www.jaxequestriancenter.com','equine',2,3,400,200,2500,1,1),
('Escambia County Equestrian Center','escambia-equestrian','Pensacola','FL','7751 Mobile Hwy, Pensacola, FL 32526',NULL,'equine',1,2,200,100,1500,1,1),
('Palm Beach International Equestrian Center','pbiec','Wellington','FL','3400 Equestrian Club Dr, Wellington, FL 33414','https://www.pbiec.com','equine',2,12,2500,400,5000,1,1),
-- LOUISIANA / MISSISSIPPI / ARKANSAS
('Ike Hamilton Expo Center','ike-hamilton-expo','West Monroe','LA','501 Mane St, West Monroe, LA 71292','https://www.ikehamiltonexpo.com','multi-use',1,1,400,200,2900,1,1),
('Farr Park Equestrian Center','farr-park-equestrian','Baton Rouge','LA','6402 River Rd, Baton Rouge, LA 70820',NULL,'equine',1,2,200,100,1500,1,1),
('Kirk Fordice Equine Center','kirk-fordice-equine','Jackson','MS','1207 Mississippi St, Jackson, MS 39202','https://fairgrounds.mdac.ms.gov','equine',1,2,600,300,6500,1,1),
('Arkansas State Fairgrounds','arkansas-state-fair','Little Rock','AR','2600 Howard St, Little Rock, AR 72206','https://www.arkansasstatefair.com','fairgrounds',2,2,500,300,6000,1,1),
('Kay Rodgers Park','kay-rodgers-park','Fort Smith','AR','4400 Midland Blvd, Fort Smith, AR 72904','https://www.kayrodgerspark.com','multi-use',2,2,400,200,4000,1,1),
-- OREGON / WASHINGTON / IDAHO
('Oregon Horse Center','oregon-horse-center','Eugene','OR','90751 Prairie Rd, Eugene, OR 97402','https://www.oregonhorsecenter.com','equine',2,3,500,200,2000,1,1),
('DevonWood Equestrian Centre','devonwood-equestrian','Sherwood','OR','25033 SW Pacific Hwy, Sherwood, OR 97140','https://www.devonwood.com','equine',1,3,300,100,1500,1,1),
('Josephine County Fairgrounds','josephine-county-fair','Grants Pass','OR','1451 Fairgrounds Rd, Grants Pass, OR 97527','https://attheexpo.com','fairgrounds',1,2,200,150,3000,1,1),
('Evergreen State Fairgrounds','evergreen-state-fair','Monroe','WA','14405 179th Ave SE, Monroe, WA 98272','https://www.evergreenfair.org','fairgrounds',1,3,402,200,2700,1,1),
('Washington State Fair Events Center','wa-state-fair','Puyallup','WA','110 9th Ave SW, Puyallup, WA 98371','https://www.thefair.com','fairgrounds',2,3,600,300,6000,1,1),
('Idaho Horse Park','idaho-horse-park','Nampa','ID','16422 Can-Ada Rd, Nampa, ID 83687','https://www.idahohorsepark.com','equine',1,3,400,200,3000,1,1),
-- VIRGINIA / MARYLAND / PENNSYLVANIA / NJ / NY
('Virginia Horse Center','virginia-horse-center','Lexington','VA','487 Maury River Rd, Lexington, VA 24450','https://www.horsecenter.org','equine',2,4,700,300,4000,1,1),
('Prince George''s Equestrian Center','pg-equestrian','Upper Marlboro','MD','14900 Pennsylvania Ave, Upper Marlboro, MD 20772','https://www.pgparks.com','equine',1,3,250,100,3000,1,1),
('Devon Horse Show Grounds','devon-horse-show','Devon','PA','23 Dorset Rd, Devon, PA 19333','https://www.devonhorseshow.net','equine',0,3,300,100,3000,1,1),
('New Jersey Equestrian Center','nj-equestrian','Pompton Plains','NJ','21 Old Jackson Ave, Pompton Plains, NJ 07444',NULL,'equine',1,2,200,50,1000,1,1),
('HITS-on-the-Hudson','hits-hudson','Saugerties','NY','454 Washington Ave Ext, Saugerties, NY 12477','https://www.hitsshows.com','equine',2,8,800,300,3000,1,1),
-- OHIO / INDIANA / MICHIGAN
('Ohio Expo Center & State Fairgrounds','ohio-expo-center','Columbus','OH','717 E 17th Ave, Columbus, OH 43211','https://www.ohiostatefair.com','fairgrounds',3,4,1500,400,10000,1,1),
('Roberts Arena','roberts-arena','Wilmington','OH','6000 SR 380, Wilmington, OH 45177','https://www.robertsarena.com','equine',2,2,500,200,3000,1,1),
('Indiana State Fairgrounds','indiana-state-fair','Indianapolis','IN','1202 E 38th St, Indianapolis, IN 46205','https://www.indianastatefair.com','fairgrounds',3,3,1200,400,8000,1,1),
('Allen County War Memorial Coliseum','allen-county-coliseum','Fort Wayne','IN','4000 Parnell Ave, Fort Wayne, IN 46805','https://www.memorialcoliseum.com','multi-use',1,1,400,200,8000,1,1),
('MSU Pavilion','msu-pavilion','East Lansing','MI','4301 Farm Ln, East Lansing, MI 48824','https://www.canr.msu.edu','equine',1,1,300,100,2000,1,1),
-- ILLINOIS / IOWA / MISSOURI / WISCONSIN / MINNESOTA
('Illinois State Fairgrounds','illinois-state-fair','Springfield','IL','801 E Sangamon Ave, Springfield, IL 62794','https://www.statefair.illinois.gov','fairgrounds',3,3,900,400,7000,1,1),
('DuQuoin State Fairgrounds','duquoin-state-fair','Du Quoin','IL','655 Executive Dr, Du Quoin, IL 62832','https://www.duquoinstatefair.net','fairgrounds',2,2,500,300,5000,1,1),
('Iowa State Fairgrounds','iowa-state-fair','Des Moines','IA','3000 E Grand Ave, Des Moines, IA 50317','https://www.iowastatefair.org','fairgrounds',3,3,1000,400,10000,1,1),
('American Royal Complex','american-royal','Kansas City','MO','1701 American Royal Ct, Kansas City, MO 64102','https://www.americanroyal.com','multi-use',2,2,800,300,6000,1,1),
('Missouri State Fairgrounds','missouri-state-fair','Sedalia','MO','2503 W 16th St, Sedalia, MO 65301','https://www.mostatefair.com','fairgrounds',3,3,800,400,6000,1,1),
('Ozark Empire Fairgrounds','ozark-empire-fair','Springfield','MO','3001 N Grant Ave, Springfield, MO 65803','https://www.ozarkempirefair.com','fairgrounds',2,2,500,250,5000,1,1),
('Alliant Energy Center','alliant-energy-center','Madison','WI','1919 Alliant Energy Center Way, Madison, WI 53713','https://www.alliantenergycenter.com','multi-use',2,2,600,300,8000,1,1),
('Minnesota State Fairgrounds','mn-state-fair','Saint Paul','MN','1265 Snelling Ave N, Saint Paul, MN 55108','https://www.mnstatefair.org','fairgrounds',3,3,800,400,10000,1,1),
('Canterbury Park','canterbury-park','Shakopee','MN','1100 Canterbury Rd S, Shakopee, MN 55379','https://www.canterburypark.com','equine',1,2,400,200,4000,1,1)
;

-- ════════════════════════════════════════════════════════════
-- EVENTS (48) — March through December 2026
-- ════════════════════════════════════════════════════════════

INSERT INTO events (arena_id, title, slug, event_type, discipline, start_date, end_date, promoter, website, status, is_approved) VALUES
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'Arizona Sun Circuit','az-sun-circuit-2026','horse show','western','2026-03-20','2026-03-29','Sun Circuit LLC','https://www.suncircuit.com','approved',1),
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'Scottsdale Parada del Sol Rodeo','parada-del-sol-2026','rodeo','rodeo','2026-03-06','2026-03-08','Scottsdale Jaycees',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'NRCHA Western Derby','nrcha-western-derby-2026','futurity','reined cow horse','2026-04-15','2026-04-26','NRCHA',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='horseshoe-park'),'Queen Creek Barrel Bash','qc-barrel-bash-2026','rodeo','barrel racing','2026-04-18','2026-04-19','AZ Barrel Racing Assoc',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='rancho-rio'),'Rancho Rio Team Roping','rancho-rio-roping-mar-2026','roping','team roping','2026-03-14','2026-03-15','Rancho Rio Productions',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='rancho-rio'),'Rancho Rio Jackpot Roping','rancho-rio-jackpot-apr-2026','roping','team roping','2026-04-11','2026-04-12','Rancho Rio Productions',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='pima-county-fairgrounds'),'Tucson Rodeo — La Fiesta de los Vaqueros','tucson-rodeo-2026','rodeo','rodeo','2026-02-21','2026-02-28','Tucson Rodeo Committee','https://www.tucsonrodeo.com','approved',1),
((SELECT id FROM arenas WHERE slug='arizona-state-fairgrounds'),'Arizona National Livestock Show','az-national-livestock-2026','horse show','multi-discipline','2026-12-28','2027-01-04','AQHA',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='lazy-e'),'Cinch Timed Event Championship','cinch-tec-2026','rodeo','timed event','2026-04-10','2026-04-12','Cinch / Lazy E Arena',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='lazy-e'),'NRHA Futurity','nrha-futurity-2026','futurity','reining','2026-11-20','2026-12-05','NRHA','https://www.nrha.com','approved',1),
((SELECT id FROM arenas WHERE slug='okc-state-fair'),'NRHA Derby','nrha-derby-2026','futurity','reining','2026-06-15','2026-06-28','NRHA','https://www.nrha.com','approved',1),
((SELECT id FROM arenas WHERE slug='tulsa-expo'),'International Finals Rodeo','ifr-2026','rodeo','rodeo','2026-01-09','2026-01-17','IFR Committee',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='south-point'),'South Point Futurity','south-point-futurity-2026','futurity','reining','2026-05-01','2026-05-05','South Point Equestrian',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='south-point'),'World Series of Team Roping','wstr-finals-2026','roping','team roping','2026-12-04','2026-12-13','WSTR','https://www.wstr.com','approved',1),
((SELECT id FROM arenas WHERE slug='reno-sparks-livestock'),'Reno Rodeo','reno-rodeo-2026','rodeo','rodeo','2026-06-18','2026-06-27','Reno Rodeo Association','https://www.renorodeo.com','approved',1),
((SELECT id FROM arenas WHERE slug='will-rogers'),'NCHA Summer Spectacular','ncha-summer-2026','futurity','cutting','2026-06-10','2026-07-05','NCHA','https://www.nchacutting.com','approved',1),
((SELECT id FROM arenas WHERE slug='will-rogers'),'Fort Worth Stock Show & Rodeo','fw-stock-show-2026','rodeo','rodeo','2026-01-16','2026-02-07','FWSSR','https://www.fwssr.com','approved',1),
((SELECT id FROM arenas WHERE slug='nrg-center-houston'),'Houston Livestock Show & Rodeo','houston-rodeo-2026','rodeo','rodeo','2026-03-03','2026-03-22','HLSR','https://www.rodeohouston.com','approved',1),
((SELECT id FROM arenas WHERE slug='star-of-texas'),'Rodeo Austin','rodeo-austin-2026','rodeo','rodeo','2026-03-13','2026-03-28','Rodeo Austin','https://www.rodeoaustin.com','approved',1),
((SELECT id FROM arenas WHERE slug='great-southwest-equestrian'),'AQHA Gulf Coast Circuit Show','aqha-gulf-coast-2026','horse show','western','2026-05-15','2026-05-18','AQHA',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='mesquite-arena'),'Mesquite Championship Rodeo','mesquite-championship-2026','rodeo','rodeo','2026-06-06','2026-08-29','Mesquite Rodeo','https://www.mesquiterodeo.com','approved',1),
((SELECT id FROM arenas WHERE slug='cheyenne-frontier-days'),'Cheyenne Frontier Days','cfd-2026','rodeo','rodeo','2026-07-17','2026-07-26','CFD Committee','https://www.cfdrodeo.com','approved',1),
((SELECT id FROM arenas WHERE slug='national-western-complex'),'National Western Stock Show','nwss-2026','horse show','multi-discipline','2026-01-10','2026-01-26','NWSS','https://www.nationalwestern.com','approved',1),
((SELECT id FROM arenas WHERE slug='colorado-horse-park'),'Colorado Horse Park Summer Series','chp-summer-2026','horse show','hunter jumper','2026-06-01','2026-08-15','CHP',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='kentucky-horse-park'),'Kentucky Three-Day Event','ky-three-day-2026','horse show','eventing','2026-04-23','2026-04-26','USEF','https://www.kyhorsepark.com','approved',1),
((SELECT id FROM arenas WHERE slug='kentucky-horse-park'),'NRHA Derby at KHP','nrha-derby-khp-2026','futurity','reining','2026-09-14','2026-09-20','NRHA',NULL,'pending',0),
((SELECT id FROM arenas WHERE slug='ky-exposition-center'),'All American Quarter Horse Congress','aaqhc-2026','horse show','western','2026-10-03','2026-10-25','AQHA','https://www.quarterhorsecongress.com','approved',1),
((SELECT id FROM arenas WHERE slug='tryon-equestrian'),'Tryon Summer Series','tryon-summer-2026','horse show','hunter jumper','2026-06-10','2026-08-20','TIEC','https://www.tryon.com','approved',1),
((SELECT id FROM arenas WHERE slug='tryon-equestrian'),'Tryon Fall Dressage','tryon-fall-dressage-2026','horse show','dressage','2026-09-25','2026-09-28','TIEC',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='pbiec'),'Winter Equestrian Festival','wef-2026','horse show','hunter jumper','2026-01-07','2026-03-29','Equestrian Sport Productions','https://www.pbiec.com','approved',1),
((SELECT id FROM arenas WHERE slug='bob-thomas-equestrian'),'Tampa Bay Classic','tampa-bay-classic-2026','horse show','multi-discipline','2026-04-08','2026-04-12','FL Horse Shows Inc',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='florida-horse-park'),'Ocala Spring Dressage','ocala-spring-dressage-2026','horse show','dressage','2026-03-20','2026-03-22','FHP',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='georgia-horse-park'),'Georgia International Horse Trials','ga-horse-trials-2026','horse show','eventing','2026-05-08','2026-05-10','GIHP',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='georgia-national-fair'),'Georgia National Rodeo','ga-national-rodeo-2026','rodeo','rodeo','2026-10-08','2026-10-17','GNFA','https://www.gnfa.com','approved',1),
((SELECT id FROM arenas WHERE slug='ohio-expo-center'),'All American Quarter Horse Congress','aqhc-columbus-2026','horse show','western','2026-10-01','2026-10-26','Ohio QHA','https://www.quarterhorsecongress.com','approved',1),
((SELECT id FROM arenas WHERE slug='indiana-state-fair'),'Indiana State Fair','indiana-state-fair-2026','fair','multi-discipline','2026-07-31','2026-08-23','IN State Fair Commission','https://www.indianastatefair.com','approved',1),
((SELECT id FROM arenas WHERE slug='iowa-state-fair'),'Iowa State Fair','iowa-state-fair-2026','fair','multi-discipline','2026-08-13','2026-08-23','Iowa State Fair Board','https://www.iowastatefair.org','approved',1),
((SELECT id FROM arenas WHERE slug='american-royal'),'American Royal World Series of Barbecue','american-royal-bbq-2026','fair','agricultural','2026-09-18','2026-09-20','American Royal',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='illinois-state-fair'),'Illinois State Fair','illinois-state-fair-2026','fair','multi-discipline','2026-08-13','2026-08-23','IL Dept of Agriculture','https://www.statefair.illinois.gov','approved',1),
((SELECT id FROM arenas WHERE slug='mn-state-fair'),'Minnesota State Fair','mn-state-fair-2026','fair','multi-discipline','2026-08-27','2026-09-07','MN State Fair Board','https://www.mnstatefair.org','approved',1),
((SELECT id FROM arenas WHERE slug='metrapark'),'NILE Stock Show & Rodeo','nile-2026','rodeo','rodeo','2026-10-17','2026-10-24','NILE','https://www.thenile.org','approved',1),
((SELECT id FROM arenas WHERE slug='central-states-fair'),'Central States Fair Rodeo','csf-rodeo-2026','rodeo','rodeo','2026-08-14','2026-08-22','CSF Board',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='del-mar-fairgrounds'),'Del Mar National Horse Show','del-mar-national-2026','horse show','hunter jumper','2026-04-28','2026-05-10','DMTC','https://www.delmarfairgrounds.com','approved',1),
((SELECT id FROM arenas WHERE slug='hits-hudson'),'HITS Saugerties Summer Series','hits-saugerties-2026','horse show','hunter jumper','2026-06-03','2026-09-13','HITS','https://www.hitsshows.com','approved',1),
((SELECT id FROM arenas WHERE slug='virginia-horse-center'),'Virginia Horse Festival','va-horse-festival-2026','expo','multi-discipline','2026-04-03','2026-04-05','VHC',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='lancaster-event-center'),'Lancaster Super Fair','lancaster-super-fair-2026','fair','agricultural','2026-08-06','2026-08-15','Lancaster Event Center',NULL,'approved',1),
((SELECT id FROM arenas WHERE slug='cam-plex'),'National High School Finals Rodeo','nhsfr-2026','rodeo','rodeo','2026-07-19','2026-07-25','NHSRA','https://www.nhsra.com','approved',1),
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'Arizona Equifest','az-equifest-2026','expo','multi-discipline','2026-04-04','2026-04-06','Equifest Productions',NULL,'pending',0)
;

-- ════════════════════════════════════════════════════════════
-- VENDORS (24)
-- ════════════════════════════════════════════════════════════

INSERT INTO vendors (arena_id, vendor_name, slug, category, city, state, contact_email, booth_location, website) VALUES
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'Superior Saddlery','superior-saddlery','tack','Scottsdale','AZ','info@superiorsaddlery.com','Barn 4 — Booth 12',NULL),
((SELECT id FROM arenas WHERE slug='will-rogers'),'Bobs Custom Saddles','bobs-custom-saddles','tack','Fort Worth','TX','info@bobscustomsaddles.com','Exhibit Hall B — Booth 7','https://www.bobscustomsaddles.com'),
((SELECT id FROM arenas WHERE slug='lazy-e'),'Cactus Saddlery','cactus-saddlery-vendor','tack','Greenville','TX','sales@cactussaddlery.com','Main Concourse — Booth 3','https://www.cactussaddlery.com'),
(NULL,'Cactus Ropes','cactus-ropes','roping','Tonopah','AZ','orders@cactusropes.com',NULL,'https://www.cactusropes.com'),
(NULL,'Classic Equine','classic-equine','equipment','Weatherford','TX','support@classisequine.com',NULL,'https://www.classisequine.com'),
(NULL,'Professional''s Choice','professionals-choice','equipment','El Cajon','CA','info@profchoice.com',NULL,'https://www.profchoice.com'),
(NULL,'Purina Feed','purina-feed-vendor','feed','St. Louis','MO','info@purinamills.com',NULL,'https://www.purinamills.com'),
(NULL,'Nutrena Feeds','nutrena-feeds','feed','Minneapolis','MN','info@nutrenaworld.com',NULL,'https://www.nutrenaworld.com'),
(NULL,'Tribute Equine Nutrition','tribute-equine','feed','Sulphur Springs','TX','info@tributeequine.com',NULL,'https://www.tributeequinenutrition.com'),
(NULL,'Farnam','farnam-products','equipment','Phoenix','AZ','info@farnam.com',NULL,'https://www.farnam.com'),
((SELECT id FROM arenas WHERE slug='south-point'),'Martin Saddlery','martin-saddlery','tack','Greenville','TX','sales@martinsaddlery.com','Arena Level — Booth 15','https://www.martinsaddlery.com'),
((SELECT id FROM arenas WHERE slug='nrg-center-houston'),'Lonestar Trailer Sales','lonestar-trailers','trailer','Houston','TX','sales@lonestartrailers.com','Outdoor Lot A',NULL),
((SELECT id FROM arenas WHERE slug='kentucky-horse-park'),'Shires Equestrian','shires-equestrian','apparel','Lexington','KY','info@shiresequestrian.com','Vendor Village — Tent 6','https://www.shiresequestrian.com'),
((SELECT id FROM arenas WHERE slug='tryon-equestrian'),'Essex Classics','essex-classics','apparel','Chester','NJ','info@essexclassics.com','Shopping Village — Unit 12','https://www.essexclassics.com'),
(NULL,'Platinum Performance','platinum-perf-vendor','feed','Buellton','CA','info@platinumperformance.com',NULL,'https://www.platinumperformance.com'),
(NULL,'Equine Insurance Agency','equine-insurance-agency','insurance','Lexington','KY','info@equineinsurance.com',NULL,NULL),
(NULL,'Great Plains Veterinary','great-plains-vet','veterinary','Oklahoma City','OK','info@gpvet.com',NULL,NULL),
(NULL,'Desert Forge Farrier Supply','desert-forge','farrier','Phoenix','AZ','sales@desertforge.com',NULL,NULL),
(NULL,'Vettec Hoof Care','vettec-hoof-care','farrier','Oxnard','CA','info@vettec.com',NULL,'https://www.vettec.com'),
((SELECT id FROM arenas WHERE slug='pbiec'),'Voltaire Design','voltaire-design','tack','Wellington','FL','info@voltairedesign.com','Exhibitor Row — Booth 22','https://www.voltairedesign.com'),
((SELECT id FROM arenas WHERE slug='cheyenne-frontier-days'),'Wrangler Western Wear','wrangler-western','apparel','Cheyenne','WY','events@wrangler.com','Indian Village Market',NULL),
((SELECT id FROM arenas WHERE slug='national-western-complex'),'Sundance Trailer Sales','sundance-trailers','trailer','Denver','CO','sales@sundancetrailers.com','Outdoor Display — Lot C',NULL),
(NULL,'Smartpak Equine','smartpak-equine','equipment','Plymouth','MA','info@smartpak.com',NULL,'https://www.smartpak.com'),
(NULL,'Weatherbeeta USA','weatherbeeta-usa','equipment','Greenville','SC','info@weatherbeeta.com',NULL,'https://www.weatherbeeta.com')
;

-- ════════════════════════════════════════════════════════════
-- SPONSORS (16)
-- ════════════════════════════════════════════════════════════

INSERT INTO sponsors (arena_id, sponsor_name, slug, sponsor_level, website, is_active) VALUES
(NULL,'Purina','purina','platinum','https://www.purinamills.com',1),
(NULL,'Wrangler','wrangler','platinum','https://www.wrangler.com',1),
(NULL,'AQHA','aqha','platinum','https://www.aqha.com',1),
(NULL,'Cinch Jeans','cinch-jeans','gold','https://www.cinch.com',1),
(NULL,'Platinum Performance','platinum-performance','gold','https://www.platinumperformance.com',1),
(NULL,'Professional''s Choice','professionals-choice-sponsor','gold','https://www.profchoice.com',1),
(NULL,'Classic Equine','classic-equine-sponsor','gold','https://www.classisequine.com',1),
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'Cactus Saddlery','cactus-saddlery','silver','https://www.cactussaddlery.com',1),
((SELECT id FROM arenas WHERE slug='lazy-e'),'Resistol','resistol','silver','https://www.resistol.com',1),
(NULL,'Nutrena','nutrena','silver','https://www.nutrenaworld.com',1),
(NULL,'Martin Saddlery','martin-saddlery-sponsor','silver','https://www.martinsaddlery.com',1),
(NULL,'Farnam','farnam-sponsor','silver','https://www.farnam.com',1),
(NULL,'Smartpak','smartpak-sponsor','bronze','https://www.smartpak.com',1),
(NULL,'Weatherbeeta','weatherbeeta-sponsor','bronze','https://www.weatherbeeta.com',1),
(NULL,'Vettec','vettec-sponsor','bronze','https://www.vettec.com',1),
(NULL,'Tribute Equine Nutrition','tribute-sponsor','bronze','https://www.tributeequinenutrition.com',1)
;

-- ════════════════════════════════════════════════════════════
-- USERS (3)
-- ════════════════════════════════════════════════════════════

INSERT INTO users (arena_id, email, password_hash, display_name, role) VALUES
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'admin@arenanetwork.com','$2b$10$placeholder_hash_replace_in_production','Platform Admin','admin'),
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'manager@westworld.example.com','$2b$10$placeholder_hash_replace_in_production','WestWorld Manager','manager'),
((SELECT id FROM arenas WHERE slug='lazy-e'),'ops@lazye.example.com','$2b$10$placeholder_hash_replace_in_production','Lazy E Operations','manager')
;

-- ════════════════════════════════════════════════════════════
-- NEWS (12)
-- ════════════════════════════════════════════════════════════

INSERT INTO news (arena_id, title, slug, body, publish_date, is_published) VALUES
(NULL,'Arena Network Platform Launches for 2026 Season','arena-network-launch-2026','The Arena Network, a new national directory and calendar platform for agricultural and equine centers, officially launches for the 2026 season. The platform connects 124 arenas across 38 states with event promoters, vendors, and sponsors in a single searchable hub designed for the western and agricultural event industry. Arena managers can claim their facilities, manage events, and connect with vendors through the dashboard.','2026-03-01',1),
((SELECT id FROM arenas WHERE slug='westworld-scottsdale'),'WestWorld Announces 2026 Sun Circuit Dates','westworld-sun-circuit-dates-2026','WestWorld of Scottsdale has confirmed the 2026 Arizona Sun Circuit will run March 20 through March 29. The annual show draws thousands of competitors across multiple western disciplines and is one of the largest events on the WestWorld calendar. Entry information and stall reservations opened January 15. WestWorld has expanded RV parking capacity to 800 spaces for this year''s event.','2026-01-10',1),
((SELECT id FROM arenas WHERE slug='lazy-e'),'Lazy E Arena Completes Indoor Lighting Upgrade','lazy-e-lighting-upgrade-2026','Lazy E Arena in Guthrie, Oklahoma has completed a full LED lighting upgrade to its main indoor arena, improving visibility for both competitors and spectators during evening performances. The $1.2 million project was completed ahead of the 2026 Cinch Timed Event Championship. The new system reduces energy consumption by 60 percent while doubling lux levels at ground level.','2026-02-01',1),
((SELECT id FROM arenas WHERE slug='cheyenne-frontier-days'),'Cheyenne Frontier Days Celebrates 130 Years','cfd-130-years-2026','Cheyenne Frontier Days marks its 130th anniversary in 2026 with an expanded 10-day schedule running July 17 through July 26. The Daddy of ''em All will feature more than 1,200 contestants competing for over $1 million in prize money across all standard PRCA events. New this year is an expanded night show concert lineup and a dedicated Western heritage museum exhibit on the grounds.','2026-03-15',1),
((SELECT id FROM arenas WHERE slug='nrg-center-houston'),'Houston Livestock Show Breaks Attendance Record','houston-rodeo-attendance-2026','The 2026 Houston Livestock Show and Rodeo set a new single-day attendance record on March 14, with over 85,000 visitors passing through the NRG Park gates. The three-week event continues to be the world''s largest livestock show and rodeo, with over $30 million awarded in scholarships and educational commitments since its founding.','2026-03-16',1),
((SELECT id FROM arenas WHERE slug='tryon-equestrian'),'Tryon Equestrian Center Adds New Cross-Country Course','tryon-xc-course-2026','Tryon International Equestrian Center in Mill Spring, North Carolina has unveiled a new championship-level cross-country course designed by Olympic course designer Captain Mark Phillips. The course spans 200 acres of the venue''s rolling terrain and will debut at the 2026 Tryon Fall Horse Trials in October.','2026-02-20',1),
((SELECT id FROM arenas WHERE slug='pbiec'),'Wellington Winter Equestrian Festival Sets Prize Record','wef-prize-record-2026','The 2026 Winter Equestrian Festival at the Palm Beach International Equestrian Center will offer a record $9 million in prize money across its 12-week schedule. The circuit, running January through March, draws top show jumping and hunter competitors from more than 30 countries. PBIEC recently completed a $15 million expansion adding 400 new permanent stalls.','2026-01-05',1),
((SELECT id FROM arenas WHERE slug='national-western-complex'),'National Western Stock Show Announces 2026 Headliners','nwss-headliners-2026','The 2026 National Western Stock Show in Denver has announced its entertainment lineup for the January 10 through 26 run. The event, in its 120th year, will feature 30 different breeds in livestock competition, a PRCA rodeo series, and for the first time a dedicated ranch horse competition showcasing working ranch skills.','2025-12-15',1),
((SELECT id FROM arenas WHERE slug='kentucky-horse-park'),'Kentucky Horse Park to Host 2026 USEF National Championships','khp-usef-nationals-2026','The Kentucky Horse Park in Lexington has been selected to host the 2026 USEF Dressage National Championships, scheduled for September. The 1,200-acre facility will utilize both the Alltech Arena and Rolex Stadium for competition, with the adjacent Campground offering 400 RV sites with full hookups for competitors traveling with their horses.','2026-02-10',1),
((SELECT id FROM arenas WHERE slug='south-point'),'South Point Announces Expanded 2026 Calendar','south-point-calendar-2026','South Point Arena and Equestrian Center in Las Vegas has released its 2026 calendar, featuring 45 weeks of equine competition. Highlights include the South Point Futurity in May, the World Series of Team Roping finals in December, and a new monthly jackpot roping series launching in March. The venue has invested $3 million in arena footing improvements across both the main and warm-up arenas.','2026-01-20',1),
((SELECT id FROM arenas WHERE slug='metrapark'),'MetraPark Billings Prepares for 2026 NILE','metrapark-nile-prep-2026','MetraPark in Billings, Montana is undergoing facility improvements ahead of the 2026 Northern International Livestock Exposition in October. Upgrades include new livestock handling facilities, expanded vendor space in the trade show area, and improved Wi-Fi coverage throughout the 10,000-seat First Interstate Arena. The NILE draws competitors from across the United States and Canada.','2026-03-10',1),
(NULL,'League Membership Now Open to All Agricultural Centers','league-membership-open-2026','The League of Agricultural and Equine Centers is now accepting membership applications from arenas, fairgrounds, and equestrian facilities nationwide. Membership benefits include listing in the Arena Network directory, access to the event calendar platform, vendor and sponsor matching tools, and AI-powered event scraping for automatic calendar population. Founding members receive premium placement and a dedicated account manager for the 2026 season.','2026-03-16',1)
;

-- ════════════════════════════════════════════════════════════
-- VERIFY
-- ════════════════════════════════════════════════════════════
