import * as cheerio from 'cheerio';
import { ParsedPage } from '../types';


export function parsePage(html: string): ParsedPage {
  return cheerio.load(html, {
    // Treat input as HTML (not XML — avoids self-closing tag issues)
    xmlMode: false,
  });
}