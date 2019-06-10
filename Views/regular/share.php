<div class="share-icons"<?php if (@$data['bg_color']): ?> style="background-color: <?= @$data['bg_color'] ?>"<?php endif; ?>>
    <div class="share-icons--container">
        <?php foreach (@$data['services'] as $service): ?>
            <a href="<?= sprintf($service['url'], $service['handle']); ?>" target="_blank" title="<?= $service['name']; ?>">
                <span class="service-icon">
                    <?php if (!empty($service['image'])): ?>
                        <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                    <?php endif; ?>
                </span>
            </a>
        <?php endforeach; ?>
    </div>
    <div class="clearfix"></div>
    <footer style="<?php if (@$data['bg_color']): ?>background-color: <?= @$data['bg_color'] ?>;<?php endif; ?><?php if (@$data['border_color']): ?>border-color: <?= @$data['border_color'] ?>;<?php endif; ?>">
        <a href="//gol.li<?= @$data['base_path']; ?>/" target="_blank" class="float-right"<?php if (@$data['font_color']): ?> style="color: <?= @$data['font_color'] ?>"<?php endif; ?>>gol.li</a>
        <span class="float-right"<?php if (@$data['font_color']): ?> style="color: <?= @$data['font_color'] ?>"<?php endif; ?>>social network hub powered by</span>
        <div class="clearfix"></div>
    </footer>
</div>
