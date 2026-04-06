import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TopbarComponent } from '../../../shared/components/topbar/topbar.component';

@Component({
  selector: 'app-message-mx',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './message-mx.component.html',
  styleUrls: ['./message-mx.component.scss']
})
export class MessageMxComponent implements OnInit {
  virementId = '';
  ongletActif = 'pacs008';

  messages = [
    {
      id: 'pacs008',
      label: 'pacs.008 — Envoi',
      statut: 'acquitte',
      dateHeure: '11/03/2026 · 10h02',
      network: 'SWIFT GPI',
      xml: `&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;<span class="mx-tag">Document</span> xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.09"&gt;
  &lt;<span class="mx-tag">FIToFICstmrCdtTrf</span>&gt;
    &lt;<span class="mx-tag">GrpHdr</span>&gt;
      &lt;<span class="mx-tag">MsgId</span>&gt;<span class="mx-val">BKCMMAMC2026031100001</span>&lt;/MsgId&gt;
      &lt;<span class="mx-tag">CreDtTm</span>&gt;<span class="mx-val">2026-03-11T10:02:14</span>&lt;/CreDtTm&gt;
      &lt;<span class="mx-tag">NbOfTxs</span>&gt;<span class="mx-val">1</span>&lt;/NbOfTxs&gt;
      &lt;<span class="mx-tag">SttlmInf</span>&gt;
        &lt;<span class="mx-tag">SttlmMtd</span>&gt;<span class="mx-val">CLRG</span>&lt;/SttlmMtd&gt;
      &lt;/SttlmInf&gt;
    &lt;/GrpHdr&gt;
    &lt;<span class="mx-tag">CdtTrfTxInf</span>&gt;
      &lt;<span class="mx-tag">PmtId</span>&gt;
        &lt;<span class="mx-tag">EndToEndId</span>&gt;<span class="mx-val">VIR-2026-4821</span>&lt;/EndToEndId&gt;
        &lt;<span class="mx-tag">TxId</span>&gt;<span class="mx-val">BKCMMAMC2026031100001</span>&lt;/TxId&gt;
      &lt;/PmtId&gt;
      &lt;<span class="mx-tag">IntrBkSttlmAmt</span> <span class="mx-attr">Ccy</span>="<span class="mx-val">MAD</span>"&gt;
        <span class="mx-val">250000.00</span>
      &lt;/IntrBkSttlmAmt&gt;
      &lt;<span class="mx-tag">Dbtr</span>&gt;
        &lt;<span class="mx-tag">FinInstnId</span>&gt;
          &lt;<span class="mx-tag">BICFI</span>&gt;<span class="mx-val">BKCMMAMC</span>&lt;/BICFI&gt;
        &lt;/FinInstnId&gt;
      &lt;/Dbtr&gt;
      &lt;<span class="mx-tag">Cdtr</span>&gt;
        &lt;<span class="mx-tag">FinInstnId</span>&gt;
          &lt;<span class="mx-tag">BICFI</span>&gt;<span class="mx-val">SGMBMAMC</span>&lt;/BICFI&gt;
        &lt;/FinInstnId&gt;
      &lt;/Cdtr&gt;
    &lt;/CdtTrfTxInf&gt;
  &lt;/FIToFICstmrCdtTrf&gt;
&lt;/Document&gt;`
    },
    {
      id: 'pacs002',
      label: 'pacs.002 — Accusé',
      statut: 'acquitte',
      dateHeure: '11/03/2026 · 10h08',
      network: 'SWIFT GPI',
      xml: `&lt;?xml version="1.0" encoding="UTF-8"?&gt;
&lt;<span class="mx-tag">Document</span> xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.002.001.10"&gt;
  &lt;<span class="mx-tag">FIToFIPmtStsRpt</span>&gt;
    &lt;<span class="mx-tag">GrpHdr</span>&gt;
      &lt;<span class="mx-tag">MsgId</span>&gt;<span class="mx-val">SGMBMAMC2026031100001</span>&lt;/MsgId&gt;
      &lt;<span class="mx-tag">CreDtTm</span>&gt;<span class="mx-val">2026-03-11T10:08:22</span>&lt;/CreDtTm&gt;
    &lt;/GrpHdr&gt;
    &lt;<span class="mx-tag">TxInfAndSts</span>&gt;
      &lt;<span class="mx-tag">OrgnlEndToEndId</span>&gt;<span class="mx-val">VIR-2026-4821</span>&lt;/OrgnlEndToEndId&gt;
      &lt;<span class="mx-tag">TxSts</span>&gt;<span class="mx-val">ACCP</span>&lt;/TxSts&gt;
    &lt;/TxInfAndSts&gt;
  &lt;/FIToFIPmtStsRpt&gt;
&lt;/Document&gt;`
    }
  ];

  get messageActif() {
    return this.messages.find(m => m.id === this.ongletActif) || this.messages[0];
  }

  constructor(private route: ActivatedRoute) {}
  ngOnInit() { this.virementId = this.route.snapshot.paramMap.get('id') || ''; }

  setOnglet(id: string) { this.ongletActif = id; }
}
