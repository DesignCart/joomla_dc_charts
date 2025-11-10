<?php
defined('_JEXEC') or die;
use Joomla\CMS\Plugin\CMSPlugin;
use Joomla\CMS\Factory;

class PlgContentDccharts extends CMSPlugin
{
    protected $autoloadLanguage = true;
    private static $chartJsLoaded = false;

    public function onContentPrepare($context, &$article, &$params, $limit = 0)
    {
        if (strpos($article->text, '{dcchart') === false) return true;

        $pattern = '/\{dcchart\s+([^}]*)\}/i';
        $article->text = preg_replace_callback($pattern, [$this, 'renderChart'], $article->text);

        if (!self::$chartJsLoaded) {
            $doc = Factory::getDocument();
            $doc->addScript('https://cdn.jsdelivr.net/npm/chart.js');
            $doc->addScript(JURI::root(true) . '/plugins/content/dccharts/assets/dccharts.js');
            self::$chartJsLoaded = true;
        }
        return true;
    }

    private function renderChart($matches)
    {
        $args = [];
        preg_match_all('/(\w+)="([^"]*)"/', $matches[1], $pairs, PREG_SET_ORDER);
        foreach ($pairs as $pair) $args[$pair[1]] = $pair[2];

        $id = $args['id'] ?? uniqid('dcchart-');

        $html  = '<div class="dcchart-container" style="width:' . ($args['width'] ?? '100%') . ';height:' . ($args['height'] ?? '400px') . ';background:' . ($args['bg'] ?? 'transparent') . '">';
        $html .= '<canvas id="' . $id . '" class="dcchart"';
        foreach ($args as $k => $v) {
            $html .= ' data-' . htmlspecialchars($k) . '="' . htmlspecialchars($v) . '"';
        }
        $html .= '></canvas></div>';

        return $html;
    }
}
