# Smjernice i uslovi

Ovaj odjeljak sažima ključna pravila popunjavanja i validacije, prilagođena terminima i ponašanju ove aplikacije.

## Kako koristiti aplikaciju
- Pratite korake u čarobnjaku: Podaci o kompaniji → Konfiguracija izvještaja → Detalji o instalaciji → A_InstData → D_Processes → C_InstEmissions → E_Purchased → B_EmInst → Energija i gorivo → Proces i proizvodnja → Nabavljeni prekursori → Pregled i izvoz.
- Dugme `Dalje` je omogućeno tek kada su obavezna polja u trenutnom koraku validna; ako postoje greške, poruka „Riješi greške prije nastavka” se prikazuje u dnu koraka.
- Gornji header prikazuje status validacije (Svi podaci ispravni / broj grešaka / broj upozorenja).

## Unos vrijednosti
- Kada je vrijednost „0”, unesite `0` umjesto da ostavljate prazno — proračuni zahtijevaju eksplicitne vrijednosti.
- Poštujte jedinice prikazane uz polja (npr. MWh, t, TJ); nekonzistentne jedinice dovode do upozorenja ili pogrešnih rezultata.
- Padajuće liste (npr. CN kod) podržane su kroz pretragu/automatsko dopunjavanje; u poljima gdje je dozvoljen slobodan unos, unos je i dalje validiran.

## Obavezna, opcionalna i izračunata polja
- Obavezna polja: označena u formi i provjeravana prije prelaska na sljedeći korak.
- Opcionalna polja: korisna za detaljniji izvještaj, nisu blokirajuća.
- Izračunata polja: rezultati (npr. ukupne emisije, specifične emisije, bilansi) se popunjavaju automatski nakon unosa podataka.

## Upozorenja i greške
- Greške se javljaju kada su obavezni podaci nedostajući ili u pogrešnom formatu; dok postoji greška, `Dalje` je onemogućeno.
- Upozorenja ukazuju na potencijalnu nedosljednost (npr. neuobičajeno visoke emisije, nedovoljna obnovljiva energija) ali ne blokiraju nastavak.

## Navigacija i pregled
- Navigacija koraka je dostupna u zaglavlju; status koraka i progres su vidljivi.
- Pregled rezultata i izvoz su dostupni u završnom koraku (Excel/PDF/CSV/Štampa).

## Dodatne napomene (prilagođene iz originalnog predloška)
- Umjesto Excel boja (žuto/zelena/crvena), aplikacija koristi validacijske poruke i statusne oznake u headeru.
- Funkcionalnosti zaštite formula i „Cut & Paste” iz Excel-a u aplikaciji nisu relevantne — svi izračuni se rade u samoj aplikaciji i nisu izmjenjivi od strane korisnika.
- Spoljni izvori (EU CBAM propisi) dostupni su u zvaničnim publikacijama; po potrebi dodajte reference u „Pomoć & Referenca”.

## Pravni kontekst (sažetak)
- Uredba (EU) 2023/956 uspostavlja CBAM.
- Provedbeni akt 2023/1773 propisuje pravila za izvještavanje tokom tranzicionog perioda (1.10.2023–31.12.2025).
- Izvještaji moraju sadržati podatke o ugrađenim emisijama koje dostavlja proizvođač (operator instalacije u trećim zemljama).

Primjenjujte ova pravila u svakom koraku kako biste osigurali tačnost i potpunost prijave emisija.