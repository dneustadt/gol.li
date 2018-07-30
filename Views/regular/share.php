<div class="share-icons">
    <div class="share-icons--container">
        <?php foreach (@$data['services'] as $service): ?>
            <a href="<?= sprintf($service['url'], rawurlencode($service['handle'])); ?>" target="_blank" title="<?= $service['name']; ?>">
                <span class="service-icon">
                    <?php if (!empty($service['image'])): ?>
                        <img class="icon" src="<?= @$data['base_path']; ?><?= $service['image']; ?>" alt="<?= $service['name']; ?>">
                    <?php endif; ?>
                </span>
            </a>
        <?php endforeach; ?>
    </div>
    <div class="clearfix"></div>
    <footer>
        <a href="//gol.li<?= @$data['base_path']; ?>/" target="_blank" class="float-right">gol.li</a>
        <span class="float-right">social network hub powered by</span>
        <div class="clearfix"></div>
    </footer>
</div>
